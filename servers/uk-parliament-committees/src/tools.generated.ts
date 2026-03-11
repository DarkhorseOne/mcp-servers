import { ENDPOINTS, ENDPOINTS_BY_TOOL_NAME, type EndpointDefinition, type ParameterType } from './endpoints.generated.js';
import { buildUpstreamPath, errorToEnvelope, executeEndpoint, runtimeConfigFromEnv, toResolvedPathWithoutQuery } from './core.js';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export interface RegisterToolTarget {
  registerTool(...args: unknown[]): unknown;
}

interface RegisterToolConfig {
  title?: string;
  description?: string;
  inputSchema?: z.ZodTypeAny;
}

interface RegisterToolResponse {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

function invokeRegisterTool(
  server: RegisterToolTarget,
  name: string,
  config: RegisterToolConfig,
  handler: (input: Record<string, unknown>, extra: unknown) => Promise<RegisterToolResponse>,
): void {
  server.registerTool(
    name,
    config,
    async (input: unknown, extra: unknown) => handler((input ?? {}) as Record<string, unknown>, extra),
  );
}

function schemaForType(type: ParameterType): z.ZodTypeAny {
  switch (type) {
    case 'number':
      return z.union([z.number(), z.string()]);
    case 'boolean':
      return z.union([z.boolean(), z.string()]);
    case 'array:number':
      return z.union([z.array(z.union([z.number(), z.string()])), z.string()]);
    case 'array:string':
      return z.union([z.array(z.string()), z.string()]);
    case 'string':
    default:
      return z.string();
  }
}

function enumSchemaForValues(values: Array<string | number | boolean>): z.ZodTypeAny {
  const literals = values.map((value) => z.literal(value));
  const [first, ...rest] = literals;

  if (!first) {
    return z.never();
  }

  if (rest.length === 0) {
    return first;
  }

  const [second, ...remaining] = rest;
  if (!second) {
    return first;
  }

  return z.union([first, second, ...remaining]);
}

function schemaForParameter(parameter: {
  type: ParameterType;
  description?: string;
  enum?: Array<string | number | boolean>;
}): z.ZodTypeAny {
  let schema = schemaForType(parameter.type);

  if (parameter.enum && parameter.enum.length > 0) {
    const enumSchema = enumSchemaForValues(parameter.enum);

    if (parameter.type === 'array:string') {
      const enumOptions = new Set(parameter.enum.map((value) => String(value)));
      schema = z.union([
        z.array(enumSchema),
        z.string().refine(
          (value: string) =>
            value
              .split(',')
              .filter((item: string) => item.length > 0)
              .every((item: string) => enumOptions.has(item)),
          {
            message: 'Invalid enum value in csv list',
          },
        ),
      ]);
    } else if (parameter.type === 'array:number') {
      const enumOptions = new Set(parameter.enum.map((value) => String(value)));
      schema = z.union([
        z.array(enumSchema),
        z.string().refine(
          (value: string) =>
            value
              .split(',')
              .filter((item: string) => item.length > 0)
              .every((item: string) => enumOptions.has(item)),
          {
            message: 'Invalid enum value in csv list',
          },
        ),
      ]);
    } else {
      schema = enumSchema;
    }
  }

  if (parameter.description && parameter.description.length > 0) {
    schema = schema.describe(parameter.description);
  }

  return schema;
}

function endpointInputSchema(endpoint: EndpointDefinition): z.ZodObject<z.ZodRawShape> {
  const entries = [...endpoint.pathParams, ...endpoint.queryParams].map((parameter) => {
    const base = schemaForParameter(parameter);
    return [parameter.name, parameter.required ? base : base.optional()] as const;
  });

  const shape = Object.fromEntries(entries);
  return z.object(shape);
}

export function registerAllTools(server: RegisterToolTarget | McpServer): void {
  const runtimeConfig = runtimeConfigFromEnv();

  for (const endpoint of ENDPOINTS) {
    invokeRegisterTool(
      server,
      endpoint.toolName,
      {
        title: endpoint.toolName,
        description: endpoint.summary,
        inputSchema: endpointInputSchema(endpoint),
      },
      async (safeInput) => {
        let fallbackPath = endpoint.path;
        try {
          const candidatePath = buildUpstreamPath(endpoint, safeInput);
          fallbackPath = toResolvedPathWithoutQuery(candidatePath);
        } catch {
          fallbackPath = endpoint.path;
        }

        try {
          const result = await executeEndpoint(endpoint, safeInput, runtimeConfig);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
            structuredContent: { ...result },
          };
        } catch (error) {
          const mapped = errorToEnvelope(error, fallbackPath);
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: JSON.stringify(mapped.body),
              },
            ],
            structuredContent: { ...mapped.body },
          };
        }
      },
    );
  }
}

export const TOOL_NAMES = ENDPOINTS.map((endpoint) => endpoint.toolName);
export const TOOL_COUNT = TOOL_NAMES.length;
export { ENDPOINTS_BY_TOOL_NAME };

import { ENDPOINTS, ENDPOINTS_BY_TOOL_NAME, type EndpointDefinition, type ParameterType } from './endpoints.generated.js';
import { errorToEnvelope, executeEndpoint, runtimeConfigFromEnv } from './core.js';

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

function endpointInputSchema(endpoint: EndpointDefinition): z.ZodObject<z.ZodRawShape> {
  const entries = [...endpoint.pathParams, ...endpoint.queryParams].map((parameter) => {
    const base = schemaForType(parameter.type);
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
          const mapped = errorToEnvelope(error, endpoint.path);
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

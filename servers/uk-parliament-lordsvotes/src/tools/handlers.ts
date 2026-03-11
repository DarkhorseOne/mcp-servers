import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { runtimeConfigFromEnv } from '../config.js';
import { LordsVotesApiClient } from '../client.js';
import { ToolExecutionError, toErrorEnvelope } from '../errors.js';
import type { ToolEnvelope } from '../types.js';
import { TOOL_DEFINITIONS, type ToolName } from './definitions.js';

interface RegisterToolTarget {
  registerTool(...args: unknown[]): unknown;
}

interface RegisterToolResponse {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent?: ToolEnvelope;
  isError?: boolean;
}

const toolNames = Object.keys(TOOL_DEFINITIONS) as ToolName[];

function toQueryValue(value: unknown): string | number | boolean | undefined {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return undefined;
}

function buildQueryFromInput(input: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
  return {
    SearchTerm: toQueryValue(input.searchTerm),
    MemberId: toQueryValue(input.memberId),
    IncludeWhenMemberWasTeller: toQueryValue(input.includeWhenMemberWasTeller),
    StartDate: toQueryValue(input.startDate),
    EndDate: toQueryValue(input.endDate),
    DivisionNumber: toQueryValue(input.divisionNumber),
    'TotalVotesCast.Comparator': toQueryValue(input.totalVotesCastComparator),
    'TotalVotesCast.ValueToCompare': toQueryValue(input.totalVotesCastValueToCompare),
    'Majority.Comparator': toQueryValue(input.majorityComparator),
    'Majority.ValueToCompare': toQueryValue(input.majorityValueToCompare),
    skip: toQueryValue(input.skip),
    take: toQueryValue(input.take),
  };
}

function successResponse(envelope: ToolEnvelope): RegisterToolResponse {
  return {
    content: [{ type: 'text', text: JSON.stringify(envelope) }],
    structuredContent: envelope,
  };
}

function errorResponse(envelope: ToolEnvelope): RegisterToolResponse {
  return {
    isError: true,
    content: [{ type: 'text', text: JSON.stringify(envelope) }],
    structuredContent: envelope,
  };
}

export async function executeTool(toolName: ToolName, input: Record<string, unknown>): Promise<ToolEnvelope> {
  const config = runtimeConfigFromEnv();
  const client = new LordsVotesApiClient(config);
  const definition = TOOL_DEFINITIONS[toolName];

  try {
    const parsed = definition.schema.parse(input) as Record<string, unknown>;
    if (toolName === 'get_division_by_id') {
      const divisionId = parsed.divisionId;
      if (typeof divisionId !== 'number' || !Number.isInteger(divisionId)) {
        throw new ToolExecutionError('divisionId must be an integer', 'INVALID_ARGUMENT', 400);
      }

      return await client.get({
        endpointPath: definition.endpointPath,
        pathParams: { divisionId },
      });
    }

    const query = buildQueryFromInput(parsed);
    if (toolName === 'search_divisions') {
      query.skip = typeof parsed.skip === 'number' ? parsed.skip : 0;
      query.take = typeof parsed.take === 'number' ? parsed.take : 25;
    }
    if (toolName === 'get_member_voting_records') {
      const memberId = parsed.memberId;
      if (typeof memberId !== 'number' || !Number.isInteger(memberId) || memberId < 1) {
        throw new ToolExecutionError('memberId must be an integer greater than or equal to 1', 'INVALID_ARGUMENT', 400);
      }
      query.skip = typeof parsed.skip === 'number' ? parsed.skip : 0;
      query.take = typeof parsed.take === 'number' ? parsed.take : 25;
    }

    return await client.get({
      endpointPath: definition.endpointPath,
      query,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return toErrorEnvelope(
        new ToolExecutionError('Invalid input arguments', 'INVALID_ARGUMENT', 400, {
          issues: error.issues,
        }),
        definition.endpointPath,
      );
    }
    return toErrorEnvelope(error, definition.endpointPath);
  }
}

function invokeRegisterTool(
  server: RegisterToolTarget,
  name: ToolName,
  description: string,
  schema: z.ZodTypeAny,
): void {
  server.registerTool(name, { title: name, description, inputSchema: schema }, async (input: unknown) => {
    const envelope = await executeTool(name, (input ?? {}) as Record<string, unknown>);
    return envelope.ok ? successResponse(envelope) : errorResponse(envelope);
  });
}

export function registerAllTools(server: RegisterToolTarget | McpServer): void {
  for (const toolName of toolNames) {
    const definition = TOOL_DEFINITIONS[toolName];
    invokeRegisterTool(server, toolName, definition.description, definition.schema);
  }
}

export const TOOL_NAMES = toolNames;
export const TOOL_COUNT = TOOL_NAMES.length;

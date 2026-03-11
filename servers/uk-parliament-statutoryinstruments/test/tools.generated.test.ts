import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { registerAllTools, TOOL_COUNT } from '../src/tools.generated.js';
import { ENDPOINTS } from '../src/endpoints.generated.js';

function collectStringEnumOptions(schema: unknown): string[] {
  if (!schema || typeof schema !== 'object') {
    return [];
  }

  const candidate = schema as {
    enum?: unknown[];
    const?: unknown;
    anyOf?: unknown[];
    oneOf?: unknown[];
  };

  const fromEnum = Array.isArray(candidate.enum)
    ? candidate.enum.filter((value): value is string => typeof value === 'string')
    : [];
  const fromConst = typeof candidate.const === 'string' ? [candidate.const] : [];
  const nested = [...(candidate.anyOf ?? []), ...(candidate.oneOf ?? [])].flatMap((child) => collectStringEnumOptions(child));

  return [...fromEnum, ...fromConst, ...nested];
}

describe('tools registration', () => {
  it('registers one tool per endpoint', () => {
    const toolNames: string[] = [];
    const fakeServer = {
      registerTool(name: string) {
        toolNames.push(name);
      },
    };

    registerAllTools(fakeServer);

    expect(toolNames).toHaveLength(TOOL_COUNT);
    expect(new Set(toolNames).size).toBe(TOOL_COUNT);
  });

  it('maps upstream timeout to error payload', async () => {
    const registered: Record<string, (input: unknown) => Promise<unknown>> = {};
    const fakeServer = {
      registerTool(name: string, _config: unknown, handler: (input: unknown) => Promise<unknown>) {
        registered[name] = handler;
      },
    };

    registerAllTools(fakeServer);
    const tool = registered.list_v2_statutory_instruments;
    expect(tool).toBeDefined();

    const originalFetch = globalThis.fetch;
    const timeoutError = new Error('aborted');
    timeoutError.name = 'AbortError';
    globalThis.fetch = vi.fn().mockRejectedValue(timeoutError) as unknown as typeof fetch;

    const result = (await tool?.({})) as { isError: boolean; structuredContent: { status: number; error: { code: string } } };

    expect(result.isError).toBe(true);
    expect(result.structuredContent.status).toBe(504);
    expect(result.structuredContent.error.code).toBe('UPSTREAM_TIMEOUT');

    globalThis.fetch = originalFetch;
  });

  it('includes enum options from resolved refs in input schema metadata', () => {
    const endpoint = ENDPOINTS.find((entry) => entry.toolName === 'list_v1_statutory_instruments');
    expect(endpoint).toBeDefined();
    if (!endpoint) {
      return;
    }

    const configs: Record<string, unknown> = {};
    const fakeServer = {
      registerTool(name: string, config: unknown) {
        configs[name] = config;
      },
    };

    registerAllTools(fakeServer);

    const config = configs[endpoint.toolName] as { inputSchema?: z.ZodTypeAny } | undefined;
    expect(config?.inputSchema).toBeDefined();

    const jsonSchema = z.toJSONSchema(config!.inputSchema!);
    const properties = (jsonSchema as { properties?: Record<string, unknown> }).properties ?? {};
    const houseSchema = properties.House as { description?: string } | undefined;

    expect(houseSchema?.description).toContain('laid in the house specified');
    const enumOptions = collectStringEnumOptions(houseSchema);
    expect(new Set(enumOptions)).toEqual(new Set(['Commons', 'Lords']));
  });

  it('rejects invalid enum input as INVALID_PARAMS with 400', async () => {
    const registered: Record<string, (input: unknown) => Promise<unknown>> = {};
    const fakeServer = {
      registerTool(name: string, _config: unknown, handler: (input: unknown) => Promise<unknown>) {
        registered[name] = handler;
      },
    };

    registerAllTools(fakeServer);
    const tool = registered.list_v1_statutory_instruments;
    expect(tool).toBeDefined();

    const result = (await tool?.({
      House: 'NotAHouse',
    })) as { isError: boolean; structuredContent: { status: number; error: { code: string } } };

    expect(result.isError).toBe(true);
    expect(result.structuredContent.status).toBe(400);
    expect(result.structuredContent.error.code).toBe('INVALID_PARAMS');
  });

  it('keeps required/optional schema mapping from endpoint metadata', () => {
    const configs: Record<string, unknown> = {};
    const fakeServer = {
      registerTool(name: string, config: unknown) {
        configs[name] = config;
      },
    };

    registerAllTools(fakeServer);

    const idConfig = configs.get_v1_business_item_by_id as { inputSchema?: z.ZodTypeAny } | undefined;
    const listConfig = configs.list_v2_statutory_instruments as { inputSchema?: z.ZodTypeAny } | undefined;
    expect(idConfig?.inputSchema).toBeDefined();
    expect(listConfig?.inputSchema).toBeDefined();

    const idJsonSchema = z.toJSONSchema(idConfig!.inputSchema!);
    const listJsonSchema = z.toJSONSchema(listConfig!.inputSchema!);

    expect((idJsonSchema as { required?: string[] }).required ?? []).toContain('id');
    expect((listJsonSchema as { required?: string[] }).required ?? []).not.toContain('Take');
  });
});

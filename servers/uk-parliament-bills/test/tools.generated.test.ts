import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { registerAllTools, TOOL_COUNT } from '../src/tools.generated.js';

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
  it('exposes expected tool count for bills endpoints', () => {
    expect(TOOL_COUNT).toBe(21);
  });

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
    const tool = registered.search_bills;
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

  it('exposes enum values in input schema metadata', () => {
    const configs: Record<string, unknown> = {};
    const fakeServer = {
      registerTool(name: string, config: unknown) {
        configs[name] = config;
      },
    };

    registerAllTools(fakeServer);

    const config = configs.search_bills as { inputSchema?: z.ZodTypeAny } | undefined;
    expect(config?.inputSchema).toBeDefined();

    const jsonSchema = z.toJSONSchema(config!.inputSchema!);
    const properties = (jsonSchema as { properties?: Record<string, unknown> }).properties ?? {};
    const sortOrderSchema = properties.SortOrder as unknown;

    const enumOptions = collectStringEnumOptions(sortOrderSchema);
    expect(new Set(enumOptions)).toEqual(new Set(['TitleAscending', 'TitleDescending', 'DateUpdatedAscending', 'DateUpdatedDescending']));
  });

  it('rejects invalid enum input as INVALID_PARAMS with 400', async () => {
    const registered: Record<string, (input: unknown) => Promise<unknown>> = {};
    const fakeServer = {
      registerTool(name: string, _config: unknown, handler: (input: unknown) => Promise<unknown>) {
        registered[name] = handler;
      },
    };

    registerAllTools(fakeServer);
    const tool = registered.search_bills;
    expect(tool).toBeDefined();

    const result = (await tool?.({ SortOrder: 'InvalidSort' })) as {
      isError: boolean;
      structuredContent: { status: number; error: { code: string } };
    };

    expect(result.isError).toBe(true);
    expect(result.structuredContent.status).toBe(400);
    expect(result.structuredContent.error.code).toBe('INVALID_PARAMS');
  });

  it('keeps required path parameter mapping in input schema', () => {
    const configs: Record<string, unknown> = {};
    const fakeServer = {
      registerTool(name: string, config: unknown) {
        configs[name] = config;
      },
    };

    registerAllTools(fakeServer);

    const config = configs.get_bill as { inputSchema?: unknown } | undefined;
    expect(config?.inputSchema).toBeDefined();

    const schema = config?.inputSchema as { safeParse: (v: unknown) => { success: boolean } };
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ billId: 1 }).success).toBe(true);
  });
});

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
  it('exposes expected tool count for now endpoints', () => {
    expect(TOOL_COUNT).toBe(2);
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
    const tool = registered.get_current_message_by_annunciator;
    expect(tool).toBeDefined();

    const originalFetch = globalThis.fetch;
    const timeoutError = new Error('aborted');
    timeoutError.name = 'AbortError';
    globalThis.fetch = vi.fn().mockRejectedValue(timeoutError) as unknown as typeof fetch;

    const result = (await tool?.({ annunciator: 'CommonsMain' })) as { isError: boolean; structuredContent: { status: number; error: { code: string } } };

    expect(result.isError).toBe(true);
    expect(result.structuredContent.status).toBe(504);
    expect(result.structuredContent.error.code).toBe('UPSTREAM_TIMEOUT');

    globalThis.fetch = originalFetch;
  });

  it('exposes annunciator enum in input schema metadata', () => {
    const configs: Record<string, unknown> = {};
    const fakeServer = {
      registerTool(name: string, config: unknown) {
        configs[name] = config;
      },
    };

    registerAllTools(fakeServer);

    const config = configs.get_current_message_by_annunciator as { inputSchema?: z.ZodTypeAny } | undefined;
    expect(config?.inputSchema).toBeDefined();

    const jsonSchema = z.toJSONSchema(config!.inputSchema!);
    const properties = (jsonSchema as { properties?: Record<string, unknown> }).properties ?? {};
    const annunciatorSchema = properties.annunciator as unknown;

    const enumOptions = collectStringEnumOptions(annunciatorSchema);
    expect(new Set(enumOptions)).toEqual(new Set(['CommonsMain', 'LordsMain']));
  });

  it('rejects invalid annunciator enum as INVALID_PARAMS with 400', async () => {
    const registered: Record<string, (input: unknown) => Promise<unknown>> = {};
    const fakeServer = {
      registerTool(name: string, _config: unknown, handler: (input: unknown) => Promise<unknown>) {
        registered[name] = handler;
      },
    };

    registerAllTools(fakeServer);
    const tool = registered.get_current_message_by_annunciator;
    expect(tool).toBeDefined();

    const result = (await tool?.({ annunciator: 'InvalidType' })) as {
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

    const currentConfig = configs.get_current_message_by_annunciator as { inputSchema?: unknown } | undefined;
    const latestConfig = configs.get_latest_message_by_annunciator_and_date as { inputSchema?: unknown } | undefined;
    expect(currentConfig?.inputSchema).toBeDefined();
    expect(latestConfig?.inputSchema).toBeDefined();

    const currentSchema = currentConfig?.inputSchema as { safeParse: (v: unknown) => { success: boolean } };
    const latestSchema = latestConfig?.inputSchema as { safeParse: (v: unknown) => { success: boolean } };

    expect(currentSchema.safeParse({}).success).toBe(false);
    expect(currentSchema.safeParse({ annunciator: 'CommonsMain' }).success).toBe(true);

    expect(latestSchema.safeParse({ annunciator: 'CommonsMain' }).success).toBe(false);
    expect(latestSchema.safeParse({ annunciator: 'CommonsMain', date: '2025-01-01T00:00:00Z' }).success).toBe(true);
  });
});

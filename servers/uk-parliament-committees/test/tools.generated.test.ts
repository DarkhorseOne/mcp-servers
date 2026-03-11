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
    const tool = registered.get_committees;
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

  it('includes parameter description and enum options in tool input schema metadata', () => {
    const endpoint = ENDPOINTS.find((entry) => entry.toolName === 'get_committees');
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
    const statusSchema = properties.CommitteeStatus as { description?: string } | undefined;

    expect(statusSchema?.description).toContain('status');
    const enumOptions = collectStringEnumOptions(statusSchema);
    expect(new Set(enumOptions)).toEqual(new Set(['Current', 'Former', 'All']));
  });

  it('rejects invalid enum input as INVALID_PARAMS with 400', async () => {
    const registered: Record<string, (input: unknown) => Promise<unknown>> = {};
    const fakeServer = {
      registerTool(name: string, _config: unknown, handler: (input: unknown) => Promise<unknown>) {
        registered[name] = handler;
      },
    };

    registerAllTools(fakeServer);
    const tool = registered.get_committees;
    expect(tool).toBeDefined();

    const result = (await tool?.({ CommitteeStatus: 'NotReal' })) as {
      isError: boolean;
      structuredContent: { status: number; error: { code: string } };
    };

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

    const requiredConfig = configs.get as { inputSchema?: z.ZodTypeAny } | undefined;
    const listConfig = configs.get_committees as { inputSchema?: z.ZodTypeAny } | undefined;
    expect(requiredConfig?.inputSchema).toBeDefined();
    expect(listConfig?.inputSchema).toBeDefined();

    const requiredJson = z.toJSONSchema(requiredConfig!.inputSchema!);
    const listJson = z.toJSONSchema(listConfig!.inputSchema!);

    expect((requiredJson as { required?: string[] }).required ?? []).toEqual(expect.arrayContaining(['FromDate', 'ToDate']));
    expect((listJson as { required?: string[] }).required ?? []).not.toContain('Take');
  });
});

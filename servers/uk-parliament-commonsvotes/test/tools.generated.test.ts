import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { registerAllTools, TOOL_COUNT } from '../src/tools.generated.js';
import { ENDPOINTS } from '../src/endpoints.generated.js';

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
    const tool = registered.ukpcv_divisions_search;
    expect(tool).toBeDefined();

    const originalFetch = globalThis.fetch;
    const timeoutError = new Error('aborted');
    timeoutError.name = 'AbortError';
    globalThis.fetch = vi.fn().mockRejectedValue(timeoutError) as unknown as typeof fetch;

    const result = (await tool?.({ format: 'json' })) as { isError: boolean; structuredContent: { status: number; error: { code: string } } };

    expect(result.isError).toBe(true);
    expect(result.structuredContent.status).toBe(504);
    expect(result.structuredContent.error.code).toBe('UPSTREAM_TIMEOUT');

    globalThis.fetch = originalFetch;
  });

  it('includes parameter descriptions in tool input schema metadata', () => {
    const searchEndpoint = ENDPOINTS.find((endpoint) => endpoint.toolName === 'ukpcv_divisions_search');
    expect(searchEndpoint).toBeDefined();
    if (!searchEndpoint) {
      return;
    }

    const configs: Record<string, unknown> = {};
    const fakeServer = {
      registerTool(name: string, config: unknown) {
        configs[name] = config;
      },
    };

    registerAllTools(fakeServer);

    const config = configs[searchEndpoint.toolName] as { inputSchema?: z.ZodTypeAny } | undefined;
    expect(config?.inputSchema).toBeDefined();

    const jsonSchema = z.toJSONSchema(config!.inputSchema!);
    const properties = (jsonSchema as { properties?: Record<string, unknown> }).properties ?? {};

    const formatSchema = properties.format as { description?: string } | undefined;
    const memberIdSchema = properties['queryParameters.memberId'] as { description?: string } | undefined;

    expect(formatSchema?.description).toBe('json or xml');
    expect(memberIdSchema?.description).toBe('Divisions returning Member with Member ID voting records');
  });
});

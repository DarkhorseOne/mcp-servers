import { describe, expect, it, vi } from 'vitest';

import { registerAllTools, TOOL_COUNT } from '../src/tools.generated.js';

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
    const tool = registered.list_parts;
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

  it('keeps required/optional schema mapping from endpoint metadata', () => {
    const configs: Record<string, unknown> = {};
    const fakeServer = {
      registerTool(name: string, config: unknown) {
        configs[name] = config;
      },
    };

    registerAllTools(fakeServer);

    const requiredConfig = configs.get_section_overview_by_section_id_and_step as { inputSchema?: unknown } | undefined;
    const optionalConfig = configs.browse_index_terms as { inputSchema?: unknown } | undefined;
    expect(requiredConfig?.inputSchema).toBeDefined();
    expect(optionalConfig?.inputSchema).toBeDefined();

    const requiredSchema = (requiredConfig?.inputSchema as { safeParse: (v: unknown) => { success: boolean } });
    const optionalSchema = (optionalConfig?.inputSchema as { safeParse: (v: unknown) => { success: boolean } });

    expect(requiredSchema.safeParse({ sectionId: 1 }).success).toBe(false);
    expect(requiredSchema.safeParse({ sectionId: 1, step: 2 }).success).toBe(true);

    expect(optionalSchema.safeParse({}).success).toBe(true);
    expect(optionalSchema.safeParse({ take: 5 }).success).toBe(true);
  });
});

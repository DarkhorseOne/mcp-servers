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
    const tool = registered.ukpi_categories_list;
    expect(tool).toBeDefined();

    const originalFetch = globalThis.fetch;
    const timeoutError = new Error('aborted');
    timeoutError.name = 'AbortError';
    globalThis.fetch = vi.fn().mockRejectedValue(timeoutError) as unknown as typeof fetch;

    const result = (await tool?.({ Take: 1 })) as { isError: boolean; structuredContent: { status: number; error: { code: string } } };

    expect(result.isError).toBe(true);
    expect(result.structuredContent.status).toBe(504);
    expect(result.structuredContent.error.code).toBe('UPSTREAM_TIMEOUT');

    globalThis.fetch = originalFetch;
  });

  it('includes parameter description and enum options in tool input schema metadata', () => {
    const interestsEndpoint = ENDPOINTS.find((endpoint) => endpoint.toolName === 'ukpi_interests_list');
    expect(interestsEndpoint).toBeDefined();
    if (!interestsEndpoint) {
      return;
    }

    const configs: Record<string, unknown> = {};
    const fakeServer = {
      registerTool(name: string, config: unknown) {
        configs[name] = config;
      },
    };

    registerAllTools(fakeServer);

    const config = configs[interestsEndpoint.toolName] as { inputSchema?: z.ZodTypeAny } | undefined;
    expect(config?.inputSchema).toBeDefined();

    const jsonSchema = z.toJSONSchema(config!.inputSchema!);
    const properties = (jsonSchema as { properties?: Record<string, unknown> }).properties ?? {};

    const sortOrderSchema = properties.SortOrder as { description?: string } | undefined;
    expect(sortOrderSchema?.description).toBe('The order in which to return records.');

    const sortOrderEnumOptions = collectStringEnumOptions(sortOrderSchema);
    expect(new Set(sortOrderEnumOptions)).toEqual(new Set(['PublishingDateDescending', 'CategoryAscending']));

    const registerDocumentEndpoint = ENDPOINTS.find((endpoint) => endpoint.toolName === 'ukpi_registers_document');
    expect(registerDocumentEndpoint).toBeDefined();
    if (!registerDocumentEndpoint) {
      return;
    }

    const registerDocConfig = configs[registerDocumentEndpoint.toolName] as { inputSchema?: z.ZodTypeAny } | undefined;
    expect(registerDocConfig?.inputSchema).toBeDefined();

    const registerDocJsonSchema = z.toJSONSchema(registerDocConfig!.inputSchema!);
    const registerDocProperties = (registerDocJsonSchema as { properties?: Record<string, unknown> }).properties ?? {};
    const typeSchema = registerDocProperties.type;
    const typeEnumOptions = collectStringEnumOptions(typeSchema);
    expect(new Set(typeEnumOptions)).toEqual(new Set(['Full', 'Updated']));
  });

  it('returns base64 payload for binary responses', async () => {
    const registered: Record<string, (input: unknown) => Promise<unknown>> = {};
    const fakeServer = {
      registerTool(name: string, _config: unknown, handler: (input: unknown) => Promise<unknown>) {
        registered[name] = handler;
      },
    };

    registerAllTools(fakeServer);
    const tool = registered.ukpi_registers_document;
    expect(tool).toBeDefined();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(Uint8Array.from([1, 2, 3, 4]), {
        status: 200,
        headers: {
          'content-type': 'application/pdf',
        },
      }),
    ) as unknown as typeof fetch;

    const result = (await tool?.({ id: 12, type: 'Full' })) as { structuredContent: { data: { mime_type: string; data_base64: string } } };

    expect(result.structuredContent.data.mime_type).toContain('application/pdf');
    expect(result.structuredContent.data.data_base64).toBe(Buffer.from([1, 2, 3, 4]).toString('base64'));

    globalThis.fetch = originalFetch;
  });
});

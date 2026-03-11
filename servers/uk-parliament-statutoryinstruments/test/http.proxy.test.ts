import { afterEach, describe, expect, it, vi } from 'vitest';
import { request as httpRequest } from 'node:http';

import { buildUpstreamPath } from '../src/core.js';
import { ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';
import { startHttpServer } from '../src/http.js';

const serversToClose: Array<import('node:http').Server> = [];

async function requestJson(port: number, path: string): Promise<{ statusCode: number; body: unknown }> {
  return await new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        method: 'GET',
        hostname: '127.0.0.1',
        port,
        path,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let body: unknown;
          try {
            body = JSON.parse(text);
          } catch {
            body = text;
          }
          resolve({
            statusCode: res.statusCode ?? 0,
            body,
          });
        });
      },
    );

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

afterEach(async () => {
  while (serversToClose.length > 0) {
    const server = serversToClose.pop();
    if (!server) {
      continue;
    }
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});

describe('parameter passthrough', () => {
  it('builds query strings and path params from raw input', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('get_v1_procedure_by_id');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      id: 'abc123',
    });

    expect(upstreamPath).toBe('/api/v1/Procedure/abc123');
  });

  it('supports repeated query params for array fields', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('list_v2_acts_of_parliament');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      Id: ['A1', 'B2'],
    });

    const parsed = new URL(`https://example.test${upstreamPath}`);
    expect(parsed.pathname).toBe('/api/v2/ActOfParliament');
    expect(parsed.searchParams.getAll('Id')).toEqual(['A1', 'B2']);
  });

  it('throws on invalid enum query param', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('list_v1_statutory_instruments');
    expect(endpoint).toBeDefined();

    expect(() =>
      buildUpstreamPath(endpoint!, {
        House: 'UnknownHouse',
      }),
    ).toThrowError(/Invalid enum value for parameter 'House'/);
  });

  it('returns healthz payload from running HTTP server', async () => {
    const server = await startHttpServer(0);
    serversToClose.push(server);

    const address = server.address();
    expect(address && typeof address === 'object').toBe(true);
    if (!address || typeof address !== 'object') {
      return;
    }

    const response = await requestJson(address.port, '/healthz');
    expect(response.statusCode).toBe(200);

    const payload = response.body as { status: string; tools: number };
    expect(payload.status).toBe('ok');
    expect(payload.tools).toBe(16);
  });

  it('returns 404 for unknown proxy endpoint with available list', async () => {
    const server = await startHttpServer(0);
    serversToClose.push(server);

    const address = server.address();
    expect(address && typeof address === 'object').toBe(true);
    if (!address || typeof address !== 'object') {
      return;
    }

    const response = await requestJson(address.port, '/proxy/does-not-exist');
    expect(response.statusCode).toBe(404);

    const payload = response.body as {
      status: number;
      error: { details?: { available_endpoints?: string[] } };
    };

    expect(payload.status).toBe(404);
    expect(payload.error.details?.available_endpoints?.length).toBe(16);
  });

  it('maps upstream timeout to 504 via HTTP proxy', async () => {
    const originalFetch = globalThis.fetch;
    const timeoutError = new Error('aborted');
    timeoutError.name = 'AbortError';
    globalThis.fetch = vi.fn().mockRejectedValue(timeoutError) as unknown as typeof fetch;

    const server = await startHttpServer(0);
    serversToClose.push(server);

    const address = server.address();
    expect(address && typeof address === 'object').toBe(true);
    if (!address || typeof address !== 'object') {
      globalThis.fetch = originalFetch;
      return;
    }

    const response = await requestJson(address.port, '/proxy/api/v2/StatutoryInstrument');
    expect(response.statusCode).toBe(504);

    const payload = response.body as {
      status: number;
      error: { code: string };
    };

    expect(payload.status).toBe(504);
    expect(payload.error.code).toBe('UPSTREAM_TIMEOUT');

    globalThis.fetch = originalFetch;
  });

  it('maps path params through HTTP proxy route', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ) as unknown as typeof fetch;

    const server = await startHttpServer(0);
    serversToClose.push(server);

    const address = server.address();
    expect(address && typeof address === 'object').toBe(true);
    if (!address || typeof address !== 'object') {
      globalThis.fetch = originalFetch;
      return;
    }

    const response = await requestJson(address.port, '/proxy/api/v1/Procedure/abc123');
    expect(response.statusCode).toBe(200);

    const payload = response.body as {
      status: number;
      upstream_path: string;
      data: { ok: boolean };
    };

    expect(payload.status).toBe(200);
    expect(payload.upstream_path).toBe('/api/v1/Procedure/abc123');
    expect(payload.data.ok).toBe(true);

    const fetchMock = globalThis.fetch as unknown as { mock: { calls: unknown[][] } };
    const calledUrl = String(fetchMock.mock.calls[0]?.[0] ?? '');
    expect(calledUrl).toContain('/api/v1/Procedure/abc123');

    globalThis.fetch = originalFetch;
  });
});

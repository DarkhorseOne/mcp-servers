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
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('search_bills');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      SearchTerm: 'energy',
      SortOrder: 'TitleAscending',
      BillStage: [1, 2],
      Skip: 10,
      Take: 5,
    });

    const url = new URL(`https://example.test${upstreamPath}`);
    expect(url.pathname).toBe('/api/v1/Bills');
    expect(url.searchParams.get('SearchTerm')).toBe('energy');
    expect(url.searchParams.get('SortOrder')).toBe('TitleAscending');
    expect(url.searchParams.getAll('BillStage')).toEqual(['1', '2']);
    expect(url.searchParams.get('Skip')).toBe('10');
    expect(url.searchParams.get('Take')).toBe('5');
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

    const payload = response.body as { status: string };
    expect(payload.status).toBe('ok');
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
    expect(payload.error.details?.available_endpoints?.length).toBe(21);
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

    const response = await requestJson(address.port, '/proxy/api/v1/Bills');
    expect(response.statusCode).toBe(504);

    const payload = response.body as {
      status: number;
      error: { code: string };
    };

    expect(payload.status).toBe(504);
    expect(payload.error.code).toBe('UPSTREAM_TIMEOUT');

    globalThis.fetch = originalFetch;
  });

  it('maps upstream network error to 502 via HTTP proxy', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    const server = await startHttpServer(0);
    serversToClose.push(server);

    const address = server.address();
    expect(address && typeof address === 'object').toBe(true);
    if (!address || typeof address !== 'object') {
      globalThis.fetch = originalFetch;
      return;
    }

    const response = await requestJson(address.port, '/proxy/api/v1/Bills');
    expect(response.statusCode).toBe(502);

    const payload = response.body as {
      status: number;
      error: { code: string };
    };

    expect(payload.status).toBe(502);
    expect(payload.error.code).toBe('UPSTREAM_NETWORK_ERROR');

    globalThis.fetch = originalFetch;
  });

  it('maps path params for bill and rss endpoints via proxy', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockImplementation(
      () =>
        Promise.resolve(
          new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        ),
    ) as unknown as typeof fetch;

    const server = await startHttpServer(0);
    serversToClose.push(server);

    const address = server.address();
    expect(address && typeof address === 'object').toBe(true);
    if (!address || typeof address !== 'object') {
      globalThis.fetch = originalFetch;
      return;
    }

    const billResponse = await requestJson(address.port, '/proxy/api/v1/Bills/1');
    expect(billResponse.statusCode).toBe(200);

    const billPayload = billResponse.body as {
      status: number;
      upstream_path: string;
    };

    expect(billPayload.status).toBe(200);
    expect(billPayload.upstream_path).toBe('/api/v1/Bills/1');

    const rssResponse = await requestJson(address.port, '/proxy/api/v1/Rss/Bills/5.rss');
    expect(rssResponse.statusCode).toBe(200);

    const fetchMock = globalThis.fetch as unknown as { mock: { calls: unknown[][] } };
    const calledUrl = String(fetchMock.mock.calls[0]?.[0] ?? '');
    expect(calledUrl).toContain('/api/v1/Bills/1');

    globalThis.fetch = originalFetch;
  });

  it('passes query params through proxy route', async () => {
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

    const response = await requestJson(address.port, '/proxy/api/v1/Bills?SearchTerm=energy&Skip=10&Take=5&SortOrder=TitleAscending');
    expect(response.statusCode).toBe(200);

    const fetchMock = globalThis.fetch as unknown as { mock: { calls: unknown[][] } };
    const calledUrl = new URL(String(fetchMock.mock.calls[0]?.[0] ?? 'https://invalid.example'));

    expect(calledUrl.pathname).toBe('/api/v1/Bills');
    expect(calledUrl.searchParams.get('SearchTerm')).toBe('energy');
    expect(calledUrl.searchParams.get('Skip')).toBe('10');
    expect(calledUrl.searchParams.get('Take')).toBe('5');
    expect(calledUrl.searchParams.get('SortOrder')).toBe('TitleAscending');

    globalThis.fetch = originalFetch;
  });
});

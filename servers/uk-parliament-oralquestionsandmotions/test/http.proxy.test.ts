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
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('get_early_day_motion_by_id');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      id: '123',
    });

    expect(upstreamPath).toBe('/EarlyDayMotion/123');
  });

  it('supports repeated query params for array fields with dotted keys', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('list_oral_questions');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      'parameters.askingMemberIds': [1, '2', 3],
      'parameters.statuses': ['Submitted', 'ToBeAsked'],
    });

    const parsed = new URL(`https://example.test${upstreamPath}`);
    expect(parsed.pathname).toBe('/oralquestions/list');
    expect(parsed.searchParams.getAll('parameters.askingMemberIds')).toEqual(['1', '2', '3']);
    expect(parsed.searchParams.getAll('parameters.statuses')).toEqual(['Submitted', 'ToBeAsked']);
  });

  it('throws on invalid enum query param', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('list_early_day_motions');
    expect(endpoint).toBeDefined();

    expect(() =>
      buildUpstreamPath(endpoint!, {
        'parameters.orderBy': 'UnknownSort',
      }),
    ).toThrowError(/Invalid enum value for parameter 'parameters.orderBy'/);
  });

  it('throws when parameters.take exceeds maximum of 100', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('list_oral_questions');
    expect(endpoint).toBeDefined();

    expect(() =>
      buildUpstreamPath(endpoint!, {
        'parameters.take': 101,
      }),
    ).toThrowError(/must be <= 100/);
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
    expect(payload.tools).toBe(4);
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
    expect(payload.error.details?.available_endpoints?.length).toBe(4);
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

    const response = await requestJson(address.port, '/proxy/oralquestions/list');
    expect(response.statusCode).toBe(504);

    const payload = response.body as {
      status: number;
      error: { code: string };
    };

    expect(payload.status).toBe(504);
    expect(payload.error.code).toBe('UPSTREAM_TIMEOUT');

    globalThis.fetch = originalFetch;
  });
});

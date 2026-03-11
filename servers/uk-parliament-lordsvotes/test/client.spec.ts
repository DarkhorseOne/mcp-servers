import { describe, expect, it, vi } from 'vitest';

import type { RuntimeConfig } from '../src/config.js';
import { LordsVotesApiClient } from '../src/client.js';

function makeConfig(): RuntimeConfig {
  return {
    upstreamBaseUrl: 'https://lordsvotes-api.parliament.uk',
    upstreamTimeoutMs: 1_000,
    userAgent: 'test-agent',
    httpPort: 8787,
  };
}

describe('LordsVotesApiClient', () => {
  it('builds path parameters correctly', async () => {
    const captured: URL[] = [];
    const fetchMock: typeof fetch = async (input) => {
      const url = input instanceof URL ? input : new URL(String(input));
      captured.push(url);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };
    vi.stubGlobal('fetch', fetchMock);

    const client = new LordsVotesApiClient(makeConfig());
    const result = await client.get({
      endpointPath: '/data/Divisions/{divisionId}',
      pathParams: { divisionId: 123 },
    });

    expect(result.ok).toBe(true);
    expect(result.endpoint).toBe('/data/Divisions/123');
    expect(captured[0]?.pathname).toBe('/data/Divisions/123');
  });

  it('maps 404 to NOT_FOUND', async () => {
    const fetchMock: typeof fetch = async () => {
      return new Response(JSON.stringify({ message: 'missing' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    };
    vi.stubGlobal('fetch', fetchMock);

    const client = new LordsVotesApiClient(makeConfig());

    await expect(() =>
      client.get({
        endpointPath: '/data/Divisions/999999',
      }),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });
});

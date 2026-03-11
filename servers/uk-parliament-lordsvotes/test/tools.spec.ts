import { afterEach, describe, expect, it, vi } from 'vitest';

import { executeTool, registerAllTools, TOOL_COUNT } from '../src/tools/handlers.js';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

describe('lords votes tools', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers all 5 tools', () => {
    const names: string[] = [];
    const fakeServer = {
      registerTool(name: string) {
        names.push(name);
      },
    };

    registerAllTools(fakeServer);

    expect(names).toHaveLength(TOOL_COUNT);
    expect(new Set(names)).toEqual(
      new Set([
        'get_division_by_id',
        'search_divisions_total_results',
        'search_divisions',
        'get_member_voting_records',
        'get_divisions_grouped_by_party',
      ]),
    );
  });

  it('maps searchTotalResults query with dotted keys', async () => {
    const captured: URL[] = [];
    const fetchMock: typeof fetch = async (input) => {
      const url = input instanceof URL ? input : new URL(String(input));
      captured.push(url);
      return jsonResponse(200, 42);
    };
    vi.stubGlobal('fetch', fetchMock);

    const envelope = await executeTool('search_divisions_total_results', {
      searchTerm: 'budget',
      memberId: 12,
      totalVotesCastComparator: 'GreaterThan',
      totalVotesCastValueToCompare: 100,
    });

    expect(envelope.ok).toBe(true);
    expect(captured).toHaveLength(1);
    const first = captured[0];
    expect(first).toBeDefined();
    if (!first) {
      return;
    }
    expect(first.pathname).toBe('/data/Divisions/searchTotalResults');
    expect(first.searchParams.get('SearchTerm')).toBe('budget');
    expect(first.searchParams.get('MemberId')).toBe('12');
    expect(first.searchParams.get('TotalVotesCast.Comparator')).toBe('GreaterThan');
    expect(first.searchParams.get('TotalVotesCast.ValueToCompare')).toBe('100');
  });

  it('applies default skip and take for search_divisions', async () => {
    const captured: URL[] = [];
    const fetchMock: typeof fetch = async (input) => {
      const url = input instanceof URL ? input : new URL(String(input));
      captured.push(url);
      return jsonResponse(200, []);
    };
    vi.stubGlobal('fetch', fetchMock);

    const envelope = await executeTool('search_divisions', {
      searchTerm: 'finance',
    });

    expect(envelope.ok).toBe(true);
    expect(captured).toHaveLength(1);
    const first = captured[0];
    expect(first).toBeDefined();
    if (!first) {
      return;
    }
    expect(first.searchParams.get('skip')).toBe('0');
    expect(first.searchParams.get('take')).toBe('25');
  });

  it('returns validation error when memberId is missing in member voting', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, {}));
    vi.stubGlobal('fetch', fetchMock);

    const envelope = await executeTool('get_member_voting_records', {});

    expect(envelope.ok).toBe(false);
    if (!envelope.ok) {
      expect(envelope.code).toBe('INVALID_ARGUMENT');
      expect(envelope.status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns validation error when comparator is invalid', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, {}));
    vi.stubGlobal('fetch', fetchMock);

    const envelope = await executeTool('get_divisions_grouped_by_party', {
      majorityComparator: 'INVALID_ENUM',
    });

    expect(envelope.ok).toBe(false);
    if (!envelope.ok) {
      expect(envelope.code).toBe('INVALID_ARGUMENT');
      expect(envelope.status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps upstream status errors into stable error codes', async () => {
    const sequence = [jsonResponse(400, { message: 'bad' }), jsonResponse(404, { message: 'missing' }), jsonResponse(503, { message: 'temp' })];
    const fetchMock = vi.fn(async () => {
      const next = sequence.shift();
      if (!next) {
        return jsonResponse(500, { message: 'unexpected' });
      }
      return next;
    });
    vi.stubGlobal('fetch', fetchMock);

    const e400 = await executeTool('search_divisions_total_results', {});
    const e404 = await executeTool('search_divisions_total_results', {});
    const e503 = await executeTool('search_divisions_total_results', {});

    expect(e400.ok).toBe(false);
    expect(e404.ok).toBe(false);
    expect(e503.ok).toBe(false);

    if (!e400.ok) {
      expect(e400.code).toBe('INVALID_ARGUMENT');
    }
    if (!e404.ok) {
      expect(e404.code).toBe('NOT_FOUND');
    }
    if (!e503.ok) {
      expect(e503.code).toBe('UNAVAILABLE');
    }
  });

  it('maps timeout error to UPSTREAM_TIMEOUT', async () => {
    const timeoutError = new Error('aborted');
    timeoutError.name = 'AbortError';
    const fetchMock: typeof fetch = async () => {
      throw timeoutError;
    };
    vi.stubGlobal('fetch', fetchMock);

    const envelope = await executeTool('search_divisions_total_results', {});
    expect(envelope.ok).toBe(false);
    if (!envelope.ok) {
      expect(envelope.code).toBe('UPSTREAM_TIMEOUT');
      expect(envelope.status).toBe(504);
    }
  });
});

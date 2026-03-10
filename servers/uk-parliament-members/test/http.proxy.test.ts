import { describe, expect, it } from 'vitest';

import { buildUpstreamPath } from '../src/core.js';
import { ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

describe('parameter passthrough', () => {
  it('builds query strings and path params from raw input', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('ukp_members_voting');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      id: '123',
      house: '2',
      page: 5,
    });

    expect(upstreamPath).toBe('/api/Members/123/Voting?house=2&page=5');
  });

  it('supports repeated query params for array fields', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('ukp_members_history');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      ids: [1, '2', 3],
    });

    expect(upstreamPath).toBe('/api/Members/History?ids=1&ids=2&ids=3');
  });

  it('throws on missing required query param', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('ukp_members_voting');
    expect(endpoint).toBeDefined();

    expect(() => buildUpstreamPath(endpoint!, { id: 1 })).toThrowError(/Missing required parameter 'house'/);
  });
});

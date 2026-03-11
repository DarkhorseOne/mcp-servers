import { describe, expect, it } from 'vitest';

import { buildUpstreamPath } from '../src/core.js';
import { ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

describe('parameter passthrough', () => {
  it('builds query strings and path params from raw input', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('ukpcv_division_get_by_id');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      divisionId: '123',
      format: 'json',
    });

    expect(upstreamPath).toBe('/data/division/123.json');
  });

  it('preserves dotted query parameter names', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('ukpcv_divisions_search');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      format: 'json',
      'queryParameters.memberId': 55,
      'queryParameters.searchTerm': 'budget',
      'queryParameters.includeWhenMemberWasTeller': 'true',
    });

    expect(upstreamPath).toContain('/data/divisions.json/search?');
    expect(upstreamPath).toContain('queryParameters.memberId=55');
    expect(upstreamPath).toContain('queryParameters.searchTerm=budget');
    expect(upstreamPath).toContain('queryParameters.includeWhenMemberWasTeller=true');
  });

  it('throws on missing required path param', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('ukpcv_division_get_by_id');
    expect(endpoint).toBeDefined();

    expect(() => buildUpstreamPath(endpoint!, { format: 'json' })).toThrowError(/Missing required parameter 'divisionId'/);
  });
});

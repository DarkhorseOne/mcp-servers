import { describe, expect, it } from 'vitest';

import { buildUpstreamPath } from '../src/core.js';
import { ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

describe('parameter passthrough', () => {
  it('builds query strings and path params from raw input', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('ukpi_registers_document');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      id: '123',
      type: 'Updated',
    });

    expect(upstreamPath).toBe('/api/v1/Registers/123/document?type=Updated');
  });

  it('serializes standard query params', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('ukpi_interests_list');
    expect(endpoint).toBeDefined();

    const upstreamPath = buildUpstreamPath(endpoint!, {
      MemberId: 55,
      PublishedFrom: '2024-01-01',
      ExpandChildInterests: 'true',
      SortOrder: 'CategoryAscending',
    });

    expect(upstreamPath).toContain('/api/v1/Interests?');
    expect(upstreamPath).toContain('MemberId=55');
    expect(upstreamPath).toContain('PublishedFrom=2024-01-01');
    expect(upstreamPath).toContain('ExpandChildInterests=true');
    expect(upstreamPath).toContain('SortOrder=CategoryAscending');
  });

  it('throws on missing required path param', () => {
    const endpoint = ENDPOINTS_BY_TOOL_NAME.get('ukpi_registers_document');
    expect(endpoint).toBeDefined();

    expect(() => buildUpstreamPath(endpoint!, { type: 'Full' })).toThrowError(/Missing required parameter 'id'/);
  });
});

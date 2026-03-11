import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '../src/endpoints.generated.js';

describe('generated endpoints', () => {
  it('contains expected endpoint count and unique identifiers', () => {
    expect(ENDPOINTS).toHaveLength(8);

    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => endpoint.path);

    expect(new Set(names).size).toBe(ENDPOINTS.length);
    expect(new Set(paths).size).toBe(ENDPOINTS.length);
  });

  it('captures descriptions on all declared parameters', () => {
    const allParameters = ENDPOINTS.flatMap((endpoint) => [...endpoint.pathParams, ...endpoint.queryParams]);
    expect(allParameters.length).toBeGreaterThan(0);
    expect(allParameters.every((parameter) => typeof parameter.description === 'string' && parameter.description.length > 0)).toBe(true);
  });
});

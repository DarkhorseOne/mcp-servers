import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '../src/endpoints.generated.js';

describe('endpoints.generated', () => {
  it('contains all 43 swagger endpoints', () => {
    expect(ENDPOINTS).toHaveLength(43);
  });

  it('has unique tool names and unique paths', () => {
    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => endpoint.path);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

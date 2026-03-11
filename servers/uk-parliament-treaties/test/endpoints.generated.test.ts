import { describe, expect, it } from 'vitest';

import { ENDPOINTS, ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

import swagger from '../../../docs/impl/uk-parliament-treaties/swagger.json' with { type: 'json' };

describe('endpoints.generated', () => {
  it('contains all 6 swagger endpoints', () => {
    expect(ENDPOINTS).toHaveLength(6);
  });

  it('has unique tool names and unique paths', () => {
    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('includes enum values from swagger refs where applicable', () => {
    const treaties = ENDPOINTS_BY_TOOL_NAME.get('list_treaties');
    expect(treaties).toBeDefined();
    expect(treaties?.queryParams.find((parameter) => parameter.name === 'House')?.enum).toEqual(['Commons', 'Lords']);
    expect(treaties?.queryParams.find((parameter) => parameter.name === 'Series')?.enum).toEqual([
      'CountrySeriesMembership',
      'EuropeanUnionSeriesMembership',
      'MiscellaneousSeriesMembership',
    ]);
    expect(treaties?.queryParams.find((parameter) => parameter.name === 'ParliamentaryProcess')?.enum).toEqual(['NotConcluded', 'Concluded']);
  });

  it('matches swagger description and enum for every generated parameter', () => {
    type SwaggerParameter = {
      name: string;
      description?: string;
      enum?: Array<string | number | boolean>;
      items?: { enum?: Array<string | number | boolean> };
      schema?: {
        enum?: Array<string | number | boolean>;
        items?: { enum?: Array<string | number | boolean> };
        $ref?: string;
      };
    };

    const refEnumMap = new Map<string, Array<string | number | boolean>>([
      ['#/components/schemas/House', ['Commons', 'Lords']],
      ['#/components/schemas/SeriesMembershipType', ['CountrySeriesMembership', 'EuropeanUnionSeriesMembership', 'MiscellaneousSeriesMembership']],
      ['#/components/schemas/ParliamentaryProcess', ['NotConcluded', 'Concluded']],
    ]);

    const operationByPath: Record<string, { parameters?: SwaggerParameter[] }> = {
      '/api/BusinessItem/{id}': (swagger.paths['/api/BusinessItem/{id}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/GovernmentOrganisation': (swagger.paths['/api/GovernmentOrganisation'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/SeriesMembership': (swagger.paths['/api/SeriesMembership'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Treaty': (swagger.paths['/api/Treaty'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Treaty/{id}': (swagger.paths['/api/Treaty/{id}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Treaty/{id}/BusinessItems': (swagger.paths['/api/Treaty/{id}/BusinessItems'] as { get: { parameters?: SwaggerParameter[] } }).get,
    };

    for (const endpoint of ENDPOINTS) {
      const operation = operationByPath[endpoint.path];
      expect(operation).toBeDefined();
      if (!operation) {
        continue;
      }

      const allParams = [...endpoint.pathParams, ...endpoint.queryParams];
      const swaggerParams = operation.parameters ?? [];

      for (const parameter of allParams) {
        const original = swaggerParams.find((entry) => entry.name === parameter.name);
        expect(original, `missing swagger parameter for ${endpoint.toolName}:${parameter.name}`).toBeDefined();

        if (!original) {
          continue;
        }

        expect(parameter.description).toBe(original.description);

        const schemaRef = original.schema?.$ref;
        const originalEnum = original.enum ?? original.items?.enum ?? original.schema?.enum ?? original.schema?.items?.enum ?? (schemaRef ? refEnumMap.get(schemaRef) : undefined);
        if (originalEnum && originalEnum.length > 0) {
          expect(parameter.enum).toEqual(originalEnum);
        } else {
          expect(parameter.enum).toBeUndefined();
        }
      }
    }
  });
});

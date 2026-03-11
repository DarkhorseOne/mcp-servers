import { describe, expect, it } from 'vitest';

import { ENDPOINTS, ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

import swagger from '../../../docs/impl/uk-parliament-statutoryinstruments/swagger.json' with { type: 'json' };

describe('endpoints.generated', () => {
  it('contains all 16 swagger endpoints', () => {
    expect(ENDPOINTS).toHaveLength(16);
  });

  it('has unique tool names and unique paths', () => {
    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('includes enum values from swagger refs where applicable', () => {
    const v1BusinessItem = ENDPOINTS_BY_TOOL_NAME.get('get_v1_business_item_by_id');
    expect(v1BusinessItem?.queryParams.find((parameter) => parameter.name === 'LaidPaper')?.enum).toEqual(['StatutoryInstrument', 'ProposedNegative']);

    const v1SiList = ENDPOINTS_BY_TOOL_NAME.get('list_v1_statutory_instruments');
    expect(v1SiList?.queryParams.find((parameter) => parameter.name === 'House')?.enum).toEqual(['Commons', 'Lords']);
    expect(v1SiList?.queryParams.find((parameter) => parameter.name === 'ParliamentaryProcessConcluded')?.enum).toEqual(['NotConcluded', 'Concluded']);
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
      ['#/components/schemas/StatutoryInstruments.Services.Domain.Enums.House', ['Commons', 'Lords']],
      ['#/components/schemas/StatutoryInstruments.Services.Domain.V1.Enums.LaidPaperType', ['StatutoryInstrument', 'ProposedNegative']],
      ['#/components/schemas/StatutoryInstruments.Services.Domain.V1.Enums.ParliamentaryProcess', ['NotConcluded', 'Concluded']],
      ['#/components/schemas/StatutoryInstruments.Services.Domain.V1.Enums.StatutoryInstrumentType', ['DraftAffirmative', 'DraftNegative', 'MadeAffirmative', 'MadeNegative']],
    ]);

    const operationByPath: Record<string, { parameters?: SwaggerParameter[] }> = {
      '/api/v1/BusinessItem/{id}': (swagger.paths['/api/v1/BusinessItem/{id}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/LayingBody': (swagger.paths['/api/v1/LayingBody'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Procedure': (swagger.paths['/api/v1/Procedure'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Procedure/{id}': (swagger.paths['/api/v1/Procedure/{id}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/ProposedNegativeStatutoryInstrument':
        (swagger.paths['/api/v1/ProposedNegativeStatutoryInstrument'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/ProposedNegativeStatutoryInstrument/{id}':
        (swagger.paths['/api/v1/ProposedNegativeStatutoryInstrument/{id}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/ProposedNegativeStatutoryInstrument/{id}/BusinessItems':
        (swagger.paths['/api/v1/ProposedNegativeStatutoryInstrument/{id}/BusinessItems'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/StatutoryInstrument': (swagger.paths['/api/v1/StatutoryInstrument'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/StatutoryInstrument/{id}': (swagger.paths['/api/v1/StatutoryInstrument/{id}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/StatutoryInstrument/{id}/BusinessItems':
        (swagger.paths['/api/v1/StatutoryInstrument/{id}/BusinessItems'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v2/ActOfParliament': (swagger.paths['/api/v2/ActOfParliament'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v2/ActOfParliament/{id}': (swagger.paths['/api/v2/ActOfParliament/{id}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v2/StatutoryInstrument': (swagger.paths['/api/v2/StatutoryInstrument'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v2/StatutoryInstrument/{instrumentId}':
        (swagger.paths['/api/v2/StatutoryInstrument/{instrumentId}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v2/StatutoryInstrument/{instrumentId}/BusinessItems':
        (swagger.paths['/api/v2/StatutoryInstrument/{instrumentId}/BusinessItems'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v2/Timeline/{timelineId}/BusinessItems':
        (swagger.paths['/api/v2/Timeline/{timelineId}/BusinessItems'] as { get: { parameters?: SwaggerParameter[] } }).get,
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

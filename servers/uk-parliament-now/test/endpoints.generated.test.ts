import { describe, expect, it } from 'vitest';

import { ENDPOINTS, ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

import swagger from '../../../docs/impl/uk-parliament-now/swagger.json' with { type: 'json' };

describe('endpoints.generated', () => {
  it('contains all 2 swagger endpoints', () => {
    expect(ENDPOINTS).toHaveLength(2);
  });

  it('has unique tool names and unique paths', () => {
    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('matches swagger descriptions and resolves annunciator enum from $ref', () => {
    type SwaggerParameter = {
      name: string;
      description?: string;
      schema?: {
        enum?: Array<string | number | boolean>;
        items?: { enum?: Array<string | number | boolean> };
        $ref?: string;
      };
      enum?: Array<string | number | boolean>;
      items?: { enum?: Array<string | number | boolean> };
    };

    const refEnumMap = new Map<string, Array<string | number | boolean>>([
      ['#/components/schemas/AnnunciatorMessageType', ['CommonsMain', 'LordsMain']],
    ]);

    const operationByPath: Record<string, { parameters?: SwaggerParameter[] }> = {
      '/api/Message/message/{annunciator}/current': (swagger.paths['/api/Message/message/{annunciator}/current'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Message/message/{annunciator}/{date}': (swagger.paths['/api/Message/message/{annunciator}/{date}'] as { get: { parameters?: SwaggerParameter[] } }).get,
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

  it('includes required enum metadata for annunciator', () => {
    const current = ENDPOINTS_BY_TOOL_NAME.get('get_current_message_by_annunciator');
    const latest = ENDPOINTS_BY_TOOL_NAME.get('get_latest_message_by_annunciator_and_date');

    expect(current?.pathParams.find((parameter) => parameter.name === 'annunciator')?.enum).toEqual(['CommonsMain', 'LordsMain']);
    expect(latest?.pathParams.find((parameter) => parameter.name === 'annunciator')?.enum).toEqual(['CommonsMain', 'LordsMain']);
    expect(latest?.pathParams.find((parameter) => parameter.name === 'date')).toMatchObject({
      required: true,
      type: 'string',
    });
  });
});

import { describe, expect, it } from 'vitest';

import { ENDPOINTS, ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

import swagger from '../../../docs/impl/uk-parliament-oralquestionsandmotions/swagger.json' with { type: 'json' };

describe('endpoints.generated', () => {
  it('contains all 4 swagger endpoints', () => {
    expect(ENDPOINTS).toHaveLength(4);
  });

  it('has unique tool names and unique paths', () => {
    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('preserves required descriptions and enum constraints from swagger', () => {
    const edmList = ENDPOINTS_BY_TOOL_NAME.get('list_early_day_motions');
    expect(edmList).toBeDefined();
    expect(edmList?.queryParams.find((parameter) => parameter.name === 'parameters.orderBy')?.enum).toEqual([
      'DateTabledAsc',
      'DateTabledDesc',
      'TitleAsc',
      'TitleDesc',
      'SignatureCountAsc',
      'SignatureCountDesc',
    ]);
    expect(edmList?.queryParams.find((parameter) => parameter.name === 'parameters.orderBy')?.description).toContain('Order results by date tabled');

    const oralQuestions = ENDPOINTS_BY_TOOL_NAME.get('list_oral_questions');
    expect(oralQuestions).toBeDefined();
    expect(oralQuestions?.queryParams.find((parameter) => parameter.name === 'parameters.questionType')?.enum).toEqual(['Substantive', 'Topical']);
    expect(oralQuestions?.queryParams.find((parameter) => parameter.name === 'parameters.answeringDateStart')?.description).toContain('Date format YYYY-MM-DD');
  });

  it('matches swagger description and enum for every generated query parameter', () => {
    type SwaggerParameter = {
      name: string;
      description?: string;
      enum?: Array<string | number | boolean>;
      items?: { enum?: Array<string | number | boolean> };
    };

    const operationByPath: Record<string, { parameters?: SwaggerParameter[] }> = {
      '/EarlyDayMotion/{id}': (swagger.paths['/EarlyDayMotion/{id}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/EarlyDayMotions/list': (swagger.paths['/EarlyDayMotions/list'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/oralquestions/list': (swagger.paths['/oralquestions/list'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/oralquestiontimes/list': (swagger.paths['/oralquestiontimes/list'] as { get: { parameters?: SwaggerParameter[] } }).get,
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

        const originalEnum = original.enum ?? original.items?.enum;
        if (originalEnum && originalEnum.length > 0) {
          expect(parameter.enum).toEqual(originalEnum);
        } else {
          expect(parameter.enum).toBeUndefined();
        }
      }
    }
  });
});

import { describe, expect, it } from 'vitest';

import { ENDPOINTS, ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

import swagger from '../../../docs/impl/uk-parliament-questions-statements/swagger.json' with { type: 'json' };

describe('endpoints.generated', () => {
  it('contains all 7 swagger endpoints', () => {
    expect(ENDPOINTS).toHaveLength(7);
  });

  it('has unique tool names and unique paths', () => {
    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('preserves required descriptions and enum constraints from swagger', () => {
    const dailyReports = ENDPOINTS_BY_TOOL_NAME.get('list_daily_reports');
    expect(dailyReports).toBeDefined();
    expect(dailyReports?.queryParams.find((parameter) => parameter.name === 'house')?.enum).toEqual([
      'Bicameral',
      'Commons',
      'Lords',
    ]);
    expect(dailyReports?.queryParams.find((parameter) => parameter.name === 'dateFrom')?.description).toContain('on or after');

    const questions = ENDPOINTS_BY_TOOL_NAME.get('list_written_questions');
    expect(questions).toBeDefined();
    expect(questions?.queryParams.find((parameter) => parameter.name === 'answered')?.enum).toEqual([
      'Any',
      'Answered',
      'Unanswered',
    ]);
    expect(questions?.queryParams.find((parameter) => parameter.name === 'questionStatus')?.enum).toEqual([
      'NotAnswered',
      'AnsweredOnly',
      'AllQuestions',
    ]);
  });

  it('matches swagger description and enum for every generated query parameter', () => {
    type SwaggerSchema = {
      enum?: Array<string | number | boolean>;
      $ref?: string;
    };

    type SwaggerParameter = {
      name: string;
      description?: string;
      enum?: Array<string | number | boolean>;
      items?: SwaggerSchema;
      schema?: SwaggerSchema;
    };

    type SwaggerPath = { get: { parameters?: SwaggerParameter[] } };

    const operationByPath: Record<string, SwaggerPath> = {
      '/api/dailyreports/dailyreports': swagger.paths['/api/dailyreports/dailyreports'] as SwaggerPath,
      '/api/writtenquestions/questions': swagger.paths['/api/writtenquestions/questions'] as SwaggerPath,
      '/api/writtenquestions/questions/{id}': swagger.paths['/api/writtenquestions/questions/{id}'] as SwaggerPath,
      '/api/writtenquestions/questions/{date}/{uin}': swagger.paths['/api/writtenquestions/questions/{date}/{uin}'] as SwaggerPath,
      '/api/writtenstatements/statements': swagger.paths['/api/writtenstatements/statements'] as SwaggerPath,
      '/api/writtenstatements/statements/{id}': swagger.paths['/api/writtenstatements/statements/{id}'] as SwaggerPath,
      '/api/writtenstatements/statements/{date}/{uin}': swagger.paths['/api/writtenstatements/statements/{date}/{uin}'] as SwaggerPath,
    };

    for (const endpoint of ENDPOINTS) {
      const operation = operationByPath[endpoint.path];
      expect(operation).toBeDefined();
      if (!operation) {
        continue;
      }

      const allParams = [...endpoint.pathParams, ...endpoint.queryParams];
      const swaggerParams = operation.get.parameters ?? [];

      for (const parameter of allParams) {
        const original = swaggerParams.find((entry) => entry.name === parameter.name);
        expect(original, `missing swagger parameter for ${endpoint.toolName}:${parameter.name}`).toBeDefined();

        if (!original) {
          continue;
        }

        expect(parameter.description).toBe(original.description);

        const schemaEnum = original.schema?.enum ?? original.items?.enum;
        const schemaRef = original.schema?.$ref ?? original.items?.$ref;
        const refName = schemaRef?.startsWith('#/components/schemas/')
          ? schemaRef.slice('#/components/schemas/'.length)
          : undefined;
        const refEnum = refName ? (swagger.components.schemas as Record<string, SwaggerSchema>)[refName]?.enum : undefined;
        const originalEnum = original.enum ?? schemaEnum ?? refEnum;
        if (originalEnum && originalEnum.length > 0) {
          expect(parameter.enum).toEqual(originalEnum);
        } else {
          expect(parameter.enum).toBeUndefined();
        }
      }
    }
  });
});

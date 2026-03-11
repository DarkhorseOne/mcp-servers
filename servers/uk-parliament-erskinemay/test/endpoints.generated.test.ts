import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '../src/endpoints.generated.js';

import swagger from '../../../docs/impl/uk-parliament-erskinemay/swagger.json' with { type: 'json' };

describe('endpoints.generated', () => {
  it('contains all 11 swagger endpoints', () => {
    expect(ENDPOINTS).toHaveLength(11);
  });

  it('has unique tool names and unique paths', () => {
    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('matches swagger descriptions and has no enums for parameters', () => {
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

    const operationByPath: Record<string, { parameters?: SwaggerParameter[] }> = {
      '/api/Chapter/{chapterNumber}': (swagger.paths['/api/Chapter/{chapterNumber}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/IndexTerm/browse': (swagger.paths['/api/IndexTerm/browse'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/IndexTerm/{indexTermId}': (swagger.paths['/api/IndexTerm/{indexTermId}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Part': (swagger.paths['/api/Part'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Part/{partNumber}': (swagger.paths['/api/Part/{partNumber}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Search/IndexTermSearchResults/{searchTerm}': (swagger.paths['/api/Search/IndexTermSearchResults/{searchTerm}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Search/Paragraph/{reference}': (swagger.paths['/api/Search/Paragraph/{reference}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Search/ParagraphSearchResults/{searchTerm}': (swagger.paths['/api/Search/ParagraphSearchResults/{searchTerm}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Search/SectionSearchResults/{searchTerm}': (swagger.paths['/api/Search/SectionSearchResults/{searchTerm}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Section/{sectionId}': (swagger.paths['/api/Section/{sectionId}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/Section/{sectionId},{step}': (swagger.paths['/api/Section/{sectionId},{step}'] as { get: { parameters?: SwaggerParameter[] } }).get,
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

        const originalEnum = original.enum ?? original.items?.enum ?? original.schema?.enum ?? original.schema?.items?.enum;
        if (originalEnum && originalEnum.length > 0) {
          expect(parameter.enum).toEqual(originalEnum);
        } else {
          expect(parameter.enum).toBeUndefined();
        }
      }
    }
  });

  it('contains expected key parameter type metadata', () => {
    const chapter = ENDPOINTS.find((endpoint) => endpoint.path === '/api/Chapter/{chapterNumber}');
    const sectionWithStep = ENDPOINTS.find((endpoint) => endpoint.path === '/api/Section/{sectionId},{step}');
    const sectionSearch = ENDPOINTS.find((endpoint) => endpoint.path === '/api/Search/SectionSearchResults/{searchTerm}');

    expect(chapter?.pathParams.find((parameter) => parameter.name === 'chapterNumber')).toMatchObject({
      required: true,
      type: 'number',
    });

    expect(sectionWithStep?.pathParams.find((parameter) => parameter.name === 'sectionId')).toMatchObject({
      required: true,
      type: 'number',
    });

    expect(sectionWithStep?.pathParams.find((parameter) => parameter.name === 'step')).toMatchObject({
      required: true,
      type: 'number',
    });

    expect(sectionSearch?.pathParams.find((parameter) => parameter.name === 'searchTerm')).toMatchObject({
      required: true,
      type: 'string',
    });
  });
});

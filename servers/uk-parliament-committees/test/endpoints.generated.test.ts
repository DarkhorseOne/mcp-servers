import { describe, expect, it } from 'vitest';

import { ENDPOINTS, ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

import swagger from '../../../docs/impl/uk-parliament-committees/swagger.json' with { type: 'json' };

describe('endpoints.generated', () => {
  it('contains all 38 swagger endpoints', () => {
    expect(ENDPOINTS).toHaveLength(38);
  });

  it('has unique tool names and unique paths', () => {
    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('preserves required descriptions and enum constraints from swagger', () => {
    const committees = ENDPOINTS_BY_TOOL_NAME.get('get_committees');
    expect(committees).toBeDefined();
    expect(committees?.queryParams.find((parameter) => parameter.name === 'CommitteeStatus')?.enum).toEqual([
      'Current',
      'Former',
      'All',
    ]);
    expect(committees?.queryParams.find((parameter) => parameter.name === 'SearchTerm')?.description).toContain('committee name');

    const banners = ENDPOINTS_BY_TOOL_NAME.get('banners');
    expect(banners).toBeDefined();
    const locationParam = banners?.pathParams.find((parameter) => parameter.name === 'location');
    expect(locationParam?.enum).toEqual([
      'HomePage',
      'FindACommitteePage',
      'CommonsCommitteeDetailsPage',
      'LordsCommitteeDetailsPage',
      'JointCommitteeDetailsPage',
      'FindAnInquiryPage',
      'FindAPublicationPage',
      'FormerCommitteesSearchPage',
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

    const paths = swagger.paths as Record<string, SwaggerPath>;

    for (const endpoint of ENDPOINTS) {
      const operation = paths[endpoint.path];
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
        const refEnum = refName
          ? (swagger.components.schemas as Record<string, SwaggerSchema>)[refName]?.enum
          : undefined;
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

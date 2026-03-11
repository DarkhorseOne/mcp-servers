import { describe, expect, it } from 'vitest';

import { ENDPOINTS, ENDPOINTS_BY_TOOL_NAME } from '../src/endpoints.generated.js';

import swagger from '../../../docs/impl/uk-parliament-bills/swagger.json' with { type: 'json' };

describe('endpoints.generated', () => {
  it('contains all 21 swagger endpoints', () => {
    expect(ENDPOINTS).toHaveLength(21);
  });

  it('has unique tool names and unique paths', () => {
    const names = ENDPOINTS.map((endpoint) => endpoint.toolName);
    const paths = ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('matches swagger descriptions and resolves enum refs', () => {
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
      ['#/components/schemas/AmendmentDecisionSearch', ['All', 'NoDecision', 'Withdrawn', 'Disagreed', 'NotMoved', 'Agreed', 'QuestionProposed', 'NotSelected', 'WithdrawnBeforeDebate', 'StoodPart', 'NotStoodPart', 'Preempted', 'NotCalled', 'NegativedOnDivision', 'AgreedOnDivision']],
      ['#/components/schemas/BillTypeCategory', ['Public', 'Private', 'Hybrid']],
      ['#/components/schemas/House', ['All', 'Commons', 'Lords', 'Unassigned']],
      ['#/components/schemas/OriginatingHouse', ['All', 'Commons', 'Lords']],
      ['#/components/schemas/BillSortOrder', ['TitleAscending', 'TitleDescending', 'DateUpdatedAscending', 'DateUpdatedDescending']],
    ]);

    const operationByPath: Record<string, { parameters?: SwaggerParameter[] }> = {
      '/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments': (swagger.paths['/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments/{amendmentId}': (swagger.paths['/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments/{amendmentId}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills/{billId}/NewsArticles': (swagger.paths['/api/v1/Bills/{billId}/NewsArticles'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/BillTypes': (swagger.paths['/api/v1/BillTypes'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills': (swagger.paths['/api/v1/Bills'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills/{billId}': (swagger.paths['/api/v1/Bills/{billId}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills/{billId}/Stages/{billStageId}': (swagger.paths['/api/v1/Bills/{billId}/Stages/{billStageId}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills/{billId}/Stages': (swagger.paths['/api/v1/Bills/{billId}/Stages'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Publications/{publicationId}/Documents/{documentId}': (swagger.paths['/api/v1/Publications/{publicationId}/Documents/{documentId}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Publications/{publicationId}/Documents/{documentId}/Download': (swagger.paths['/api/v1/Publications/{publicationId}/Documents/{documentId}/Download'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems': (swagger.paths['/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems/{pingPongItemId}': (swagger.paths['/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems/{pingPongItemId}'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/PublicationTypes': (swagger.paths['/api/v1/PublicationTypes'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills/{billId}/Publications': (swagger.paths['/api/v1/Bills/{billId}/Publications'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Bills/{billId}/Stages/{stageId}/Publications': (swagger.paths['/api/v1/Bills/{billId}/Stages/{stageId}/Publications'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Rss/allbills.rss': (swagger.paths['/api/v1/Rss/allbills.rss'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Rss/publicbills.rss': (swagger.paths['/api/v1/Rss/publicbills.rss'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Rss/privatebills.rss': (swagger.paths['/api/v1/Rss/privatebills.rss'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Rss/Bills/{id}.rss': (swagger.paths['/api/v1/Rss/Bills/{id}.rss'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Sittings': (swagger.paths['/api/v1/Sittings'] as { get: { parameters?: SwaggerParameter[] } }).get,
      '/api/v1/Stages': (swagger.paths['/api/v1/Stages'] as { get: { parameters?: SwaggerParameter[] } }).get,
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

  it('includes required enum metadata for key filters', () => {
    const bills = ENDPOINTS_BY_TOOL_NAME.get('search_bills');
    const amendments = ENDPOINTS_BY_TOOL_NAME.get('search_bill_stage_amendments');
    const sittings = ENDPOINTS_BY_TOOL_NAME.get('search_sittings');

    expect(bills?.queryParams.find((param) => param.name === 'CurrentHouse')?.enum).toEqual(['All', 'Commons', 'Lords', 'Unassigned']);
    expect(bills?.queryParams.find((param) => param.name === 'OriginatingHouse')?.enum).toEqual(['All', 'Commons', 'Lords']);
    expect(bills?.queryParams.find((param) => param.name === 'SortOrder')?.enum).toEqual(['TitleAscending', 'TitleDescending', 'DateUpdatedAscending', 'DateUpdatedDescending']);

    expect(amendments?.queryParams.find((param) => param.name === 'Decision')?.enum).toEqual([
      'All',
      'NoDecision',
      'Withdrawn',
      'Disagreed',
      'NotMoved',
      'Agreed',
      'QuestionProposed',
      'NotSelected',
      'WithdrawnBeforeDebate',
      'StoodPart',
      'NotStoodPart',
      'Preempted',
      'NotCalled',
      'NegativedOnDivision',
      'AgreedOnDivision',
    ]);

    expect(sittings?.queryParams.find((param) => param.name === 'House')?.enum).toEqual(['All', 'Commons', 'Lords', 'Unassigned']);
  });

  it('matches the fixed toolName mapping from the techspec', () => {
    const expectedMappings = new Map<string, string>([
      ['/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments', 'search_bill_stage_amendments'],
      ['/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments/{amendmentId}', 'get_bill_stage_amendment'],
      ['/api/v1/Bills/{billId}/NewsArticles', 'list_bill_news_articles'],
      ['/api/v1/BillTypes', 'list_bill_types'],
      ['/api/v1/Bills', 'search_bills'],
      ['/api/v1/Bills/{billId}', 'get_bill'],
      ['/api/v1/Bills/{billId}/Stages/{billStageId}', 'get_bill_stage_details'],
      ['/api/v1/Bills/{billId}/Stages', 'list_bill_stages'],
      ['/api/v1/Publications/{publicationId}/Documents/{documentId}', 'get_publication_document'],
      ['/api/v1/Publications/{publicationId}/Documents/{documentId}/Download', 'download_publication_document'],
      ['/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems', 'search_bill_stage_ping_pong_items'],
      ['/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems/{pingPongItemId}', 'get_bill_stage_ping_pong_item'],
      ['/api/v1/PublicationTypes', 'list_publication_types'],
      ['/api/v1/Bills/{billId}/Publications', 'list_bill_publications'],
      ['/api/v1/Bills/{billId}/Stages/{stageId}/Publications', 'list_bill_stage_publications'],
      ['/api/v1/Rss/allbills.rss', 'get_rss_all_bills'],
      ['/api/v1/Rss/publicbills.rss', 'get_rss_public_bills'],
      ['/api/v1/Rss/privatebills.rss', 'get_rss_private_bills'],
      ['/api/v1/Rss/Bills/{id}.rss', 'get_rss_bill_by_id'],
      ['/api/v1/Sittings', 'search_sittings'],
      ['/api/v1/Stages', 'list_stage_references'],
    ]);

    expect(expectedMappings.size).toBe(ENDPOINTS.length);

    for (const endpoint of ENDPOINTS) {
      const expectedToolName = expectedMappings.get(endpoint.path);
      expect(expectedToolName, `missing expected tool name for ${endpoint.path}`).toBeDefined();
      expect(endpoint.toolName).toBe(expectedToolName);
      expect(endpoint.method).toBe('GET');
    }
  });
});

export type ParameterType = 'string' | 'number' | 'boolean' | 'array:string' | 'array:number';

export interface EndpointParameter {
  name: string;
  in: 'path' | 'query';
  required: boolean;
  type: ParameterType;
  description?: string;
  enum?: Array<string | number | boolean>;
}

export interface EndpointDefinition {
  path: string;
  method: 'GET';
  toolName: string;
  summary: string;
  pathParams: EndpointParameter[];
  queryParams: EndpointParameter[];
}

const AMENDMENT_DECISION_SEARCH_ENUM = [
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
] as const;

const BILL_TYPE_CATEGORY_ENUM = ['Public', 'Private', 'Hybrid'] as const;
const HOUSE_ENUM = ['All', 'Commons', 'Lords', 'Unassigned'] as const;
const ORIGINATING_HOUSE_ENUM = ['All', 'Commons', 'Lords'] as const;
const BILL_SORT_ORDER_ENUM = ['TitleAscending', 'TitleDescending', 'DateUpdatedAscending', 'DateUpdatedDescending'] as const;

export const ENDPOINTS: EndpointDefinition[] = [
  {
    path: '/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments',
    method: 'GET',
    toolName: 'search_bill_stage_amendments',
    summary: 'Returns a list of amendments.',
    pathParams: [
      { name: 'billId', in: 'path', required: true, type: 'number', description: 'Amendments relating to a Bill with Bill ID specified' },
      { name: 'billStageId', in: 'path', required: true, type: 'number', description: 'Amendments relating to a Bill stage with Bill stage ID specified' },
    ],
    queryParams: [
      { name: 'SearchTerm', in: 'query', required: false, type: 'string' },
      { name: 'AmendmentNumber', in: 'query', required: false, type: 'string' },
      { name: 'Decision', in: 'query', required: false, type: 'string', enum: [...AMENDMENT_DECISION_SEARCH_ENUM] },
      { name: 'MemberId', in: 'query', required: false, type: 'number' },
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
  {
    path: '/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments/{amendmentId}',
    method: 'GET',
    toolName: 'get_bill_stage_amendment',
    summary: 'Returns an amendment.',
    pathParams: [
      { name: 'billId', in: 'path', required: true, type: 'number', description: 'Amendment relating to a bill with bill ID specified' },
      { name: 'billStageId', in: 'path', required: true, type: 'number', description: 'Amendment relating to a bill stage with bill stage ID specified' },
      { name: 'amendmentId', in: 'path', required: true, type: 'number', description: 'Amendment with amendment ID specified' },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/Bills/{billId}/NewsArticles',
    method: 'GET',
    toolName: 'list_bill_news_articles',
    summary: 'Returns a list of news articles for a Bill.',
    pathParams: [{ name: 'billId', in: 'path', required: true, type: 'number' }],
    queryParams: [
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
  {
    path: '/api/v1/BillTypes',
    method: 'GET',
    toolName: 'list_bill_types',
    summary: 'Returns a list of Bill types.',
    pathParams: [],
    queryParams: [
      { name: 'Category', in: 'query', required: false, type: 'string', enum: [...BILL_TYPE_CATEGORY_ENUM] },
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
  {
    path: '/api/v1/Bills',
    method: 'GET',
    toolName: 'search_bills',
    summary: 'Returns a list of Bills.',
    pathParams: [],
    queryParams: [
      { name: 'SearchTerm', in: 'query', required: false, type: 'string' },
      { name: 'Session', in: 'query', required: false, type: 'number' },
      { name: 'CurrentHouse', in: 'query', required: false, type: 'string', enum: [...HOUSE_ENUM] },
      { name: 'OriginatingHouse', in: 'query', required: false, type: 'string', enum: [...ORIGINATING_HOUSE_ENUM] },
      { name: 'MemberId', in: 'query', required: false, type: 'number' },
      { name: 'DepartmentId', in: 'query', required: false, type: 'number' },
      { name: 'BillStage', in: 'query', required: false, type: 'array:number' },
      { name: 'BillStagesExcluded', in: 'query', required: false, type: 'array:number' },
      { name: 'IsDefeated', in: 'query', required: false, type: 'boolean' },
      { name: 'IsWithdrawn', in: 'query', required: false, type: 'boolean' },
      { name: 'BillType', in: 'query', required: false, type: 'array:number' },
      { name: 'SortOrder', in: 'query', required: false, type: 'string', enum: [...BILL_SORT_ORDER_ENUM] },
      { name: 'BillIds', in: 'query', required: false, type: 'array:number' },
      { name: 'IsInAmendableStage', in: 'query', required: false, type: 'boolean' },
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
  {
    path: '/api/v1/Bills/{billId}',
    method: 'GET',
    toolName: 'get_bill',
    summary: 'Return a Bill.',
    pathParams: [{ name: 'billId', in: 'path', required: true, type: 'number', description: 'Bill with ID specified' }],
    queryParams: [],
  },
  {
    path: '/api/v1/Bills/{billId}/Stages/{billStageId}',
    method: 'GET',
    toolName: 'get_bill_stage_details',
    summary: 'Returns a Bill stage.',
    pathParams: [
      { name: 'billId', in: 'path', required: true, type: 'number', description: 'Bill stage relating to Bill with Bill ID specified' },
      { name: 'billStageId', in: 'path', required: true, type: 'number', description: 'Bill stage with ID specified' },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/Bills/{billId}/Stages',
    method: 'GET',
    toolName: 'list_bill_stages',
    summary: 'Returns all Bill stages.',
    pathParams: [{ name: 'billId', in: 'path', required: true, type: 'number', description: 'Stages relating to a Bill with Bill ID specified' }],
    queryParams: [
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
  {
    path: '/api/v1/Publications/{publicationId}/Documents/{documentId}',
    method: 'GET',
    toolName: 'get_publication_document',
    summary: 'Return information on a document.',
    pathParams: [
      { name: 'publicationId', in: 'path', required: true, type: 'number', description: 'Document with publication Id specified' },
      { name: 'documentId', in: 'path', required: true, type: 'number', description: 'Document with Id specified' },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/Publications/{publicationId}/Documents/{documentId}/Download',
    method: 'GET',
    toolName: 'download_publication_document',
    summary: 'Return a document.',
    pathParams: [
      { name: 'publicationId', in: 'path', required: true, type: 'number', description: 'Document with publication Id specified' },
      { name: 'documentId', in: 'path', required: true, type: 'number', description: 'Document with Id specified' },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems',
    method: 'GET',
    toolName: 'search_bill_stage_ping_pong_items',
    summary: 'Returns a list of motions or amendments.',
    pathParams: [
      { name: 'billId', in: 'path', required: true, type: 'number', description: 'Motions or amendments relating to a Bill with Bill ID specified' },
      { name: 'billStageId', in: 'path', required: true, type: 'number', description: 'Motions or amendments relating to a Bill stage with Bill stage ID specified' },
    ],
    queryParams: [
      { name: 'SearchTerm', in: 'query', required: false, type: 'string' },
      { name: 'AmendmentNumber', in: 'query', required: false, type: 'string' },
      { name: 'Decision', in: 'query', required: false, type: 'string', enum: [...AMENDMENT_DECISION_SEARCH_ENUM] },
      { name: 'MemberId', in: 'query', required: false, type: 'number' },
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
  {
    path: '/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems/{pingPongItemId}',
    method: 'GET',
    toolName: 'get_bill_stage_ping_pong_item',
    summary: 'Returns amendment or motion detail.',
    pathParams: [
      { name: 'billId', in: 'path', required: true, type: 'number', description: 'Motions or amendments relating to a bill with bill ID specified' },
      { name: 'billStageId', in: 'path', required: true, type: 'number', description: 'Motions or amendments relating to a bill stage with bill stage ID specified' },
      { name: 'pingPongItemId', in: 'path', required: true, type: 'number', description: 'Motions or amendments with ping pong item ID specified' },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/PublicationTypes',
    method: 'GET',
    toolName: 'list_publication_types',
    summary: 'Returns a list of publication types.',
    pathParams: [],
    queryParams: [
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
  {
    path: '/api/v1/Bills/{billId}/Publications',
    method: 'GET',
    toolName: 'list_bill_publications',
    summary: 'Return a list of Bill publications.',
    pathParams: [{ name: 'billId', in: 'path', required: true, type: 'number', description: 'Publications relating to Bill with Bill ID specified' }],
    queryParams: [],
  },
  {
    path: '/api/v1/Bills/{billId}/Stages/{stageId}/Publications',
    method: 'GET',
    toolName: 'list_bill_stage_publications',
    summary: 'Return a list of Bill stage publications.',
    pathParams: [
      { name: 'billId', in: 'path', required: true, type: 'number' },
      { name: 'stageId', in: 'path', required: true, type: 'number' },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/Rss/allbills.rss',
    method: 'GET',
    toolName: 'get_rss_all_bills',
    summary: 'Returns an Rss feed of all Bills.',
    pathParams: [],
    queryParams: [],
  },
  {
    path: '/api/v1/Rss/publicbills.rss',
    method: 'GET',
    toolName: 'get_rss_public_bills',
    summary: 'Returns an Rss feed of public Bills.',
    pathParams: [],
    queryParams: [],
  },
  {
    path: '/api/v1/Rss/privatebills.rss',
    method: 'GET',
    toolName: 'get_rss_private_bills',
    summary: 'Returns an Rss feed of private Bills.',
    pathParams: [],
    queryParams: [],
  },
  {
    path: '/api/v1/Rss/Bills/{id}.rss',
    method: 'GET',
    toolName: 'get_rss_bill_by_id',
    summary: 'Returns an Rss feed of a certain Bill.',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'number', description: 'Id of Bill' }],
    queryParams: [],
  },
  {
    path: '/api/v1/Sittings',
    method: 'GET',
    toolName: 'search_sittings',
    summary: 'Returns a list of Sittings.',
    pathParams: [],
    queryParams: [
      { name: 'House', in: 'query', required: false, type: 'string', enum: [...HOUSE_ENUM] },
      { name: 'DateFrom', in: 'query', required: false, type: 'string' },
      { name: 'DateTo', in: 'query', required: false, type: 'string' },
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
  {
    path: '/api/v1/Stages',
    method: 'GET',
    toolName: 'list_stage_references',
    summary: 'Returns a list of Bill stages.',
    pathParams: [],
    queryParams: [
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
];

export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint]));

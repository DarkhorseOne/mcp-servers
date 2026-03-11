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

const HOUSE_ENUM = ['Commons', 'Lords'] as const;
const SERIES_MEMBERSHIP_TYPE_ENUM = ['CountrySeriesMembership', 'EuropeanUnionSeriesMembership', 'MiscellaneousSeriesMembership'] as const;
const PARLIAMENTARY_PROCESS_ENUM = ['NotConcluded', 'Concluded'] as const;

export const ENDPOINTS: EndpointDefinition[] = [
  {
    path: '/api/BusinessItem/{id}',
    method: 'GET',
    toolName: 'get_business_item_by_id',
    summary: 'Returns business item by ID.',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'string', description: 'Business item with the ID specified' }],
    queryParams: [],
  },
  {
    path: '/api/GovernmentOrganisation',
    method: 'GET',
    toolName: 'list_government_organisations',
    summary: 'Returns all government organisations.',
    pathParams: [],
    queryParams: [],
  },
  {
    path: '/api/SeriesMembership',
    method: 'GET',
    toolName: 'list_series_memberships',
    summary: 'Returns all series memberships.',
    pathParams: [],
    queryParams: [],
  },
  {
    path: '/api/Treaty',
    method: 'GET',
    toolName: 'list_treaties',
    summary: 'Returns a list of treaties.',
    pathParams: [],
    queryParams: [
      { name: 'SearchText', in: 'query', required: false, type: 'string' },
      { name: 'GovernmentOrganisationId', in: 'query', required: false, type: 'number' },
      { name: 'Series', in: 'query', required: false, type: 'string', enum: [...SERIES_MEMBERSHIP_TYPE_ENUM] },
      { name: 'ParliamentaryProcess', in: 'query', required: false, type: 'string', enum: [...PARLIAMENTARY_PROCESS_ENUM] },
      { name: 'DebateScheduled', in: 'query', required: false, type: 'boolean' },
      { name: 'MotionsTabledAboutATreaty', in: 'query', required: false, type: 'boolean' },
      { name: 'CommitteeRaisedConcerns', in: 'query', required: false, type: 'boolean' },
      { name: 'House', in: 'query', required: false, type: 'string', enum: [...HOUSE_ENUM] },
      { name: 'Skip', in: 'query', required: false, type: 'number' },
      { name: 'Take', in: 'query', required: false, type: 'number' },
    ],
  },
  {
    path: '/api/Treaty/{id}',
    method: 'GET',
    toolName: 'get_treaty_by_id',
    summary: 'Returns a treaty by ID.',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'string', description: 'Treaty with ID specified' }],
    queryParams: [],
  },
  {
    path: '/api/Treaty/{id}/BusinessItems',
    method: 'GET',
    toolName: 'list_business_items_by_treaty_id',
    summary: 'Returns business items belonging to the treaty with ID.',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'string', description: 'Business items belonging to treaty with the ID specified' }],
    queryParams: [],
  },
];

export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint]));

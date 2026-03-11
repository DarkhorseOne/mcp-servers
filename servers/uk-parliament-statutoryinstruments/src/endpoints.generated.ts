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
const LAID_PAPER_TYPE_ENUM = ['StatutoryInstrument', 'ProposedNegative'] as const;
const PARLIAMENTARY_PROCESS_ENUM = ['NotConcluded', 'Concluded'] as const;
const SI_TYPE_ENUM = ['DraftAffirmative', 'DraftNegative', 'MadeAffirmative', 'MadeNegative'] as const;

export const ENDPOINTS: EndpointDefinition[] = [
  {
    path: '/api/v1/BusinessItem/{id}',
    method: 'GET',
    toolName: 'get_v1_business_item_by_id',
    summary: 'Returns business item by ID.',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'string', description: 'Business item with the ID specified' }],
    queryParams: [{ name: 'LaidPaper', in: 'query', required: false, type: 'string', description: 'Business item by laid paper type', enum: [...LAID_PAPER_TYPE_ENUM] }],
  },
  {
    path: '/api/v1/LayingBody',
    method: 'GET',
    toolName: 'list_v1_laying_bodies',
    summary: 'Returns all laying bodies.',
    pathParams: [],
    queryParams: [],
  },
  {
    path: '/api/v1/Procedure',
    method: 'GET',
    toolName: 'list_v1_procedures',
    summary: 'Returns all procedures.',
    pathParams: [],
    queryParams: [],
  },
  {
    path: '/api/v1/Procedure/{id}',
    method: 'GET',
    toolName: 'get_v1_procedure_by_id',
    summary: 'Returns procedure by ID.',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'string', description: 'Procedure with the ID specified' }],
    queryParams: [],
  },
  {
    path: '/api/v1/ProposedNegativeStatutoryInstrument',
    method: 'GET',
    toolName: 'list_v1_proposed_negative_statutory_instruments',
    summary: 'Returns a list of proposed negative statutory instruments.',
    pathParams: [],
    queryParams: [
      { name: 'Name', in: 'query', required: false, type: 'string', description: 'Proposed negative statutory instruments with the name provided' },
      {
        name: 'RecommendedForProcedureChange',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Proposed negative statutory instruments recommended for procedure change',
      },
      { name: 'DepartmentId', in: 'query', required: false, type: 'number', description: 'Proposed negative statutory instruments with the department ID specified' },
      { name: 'LayingBodyId', in: 'query', required: false, type: 'string', description: 'Proposed negative statutory instruments with the laying body ID specified' },
      { name: 'Skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0' },
      { name: 'Take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 20' },
    ],
  },
  {
    path: '/api/v1/ProposedNegativeStatutoryInstrument/{id}',
    method: 'GET',
    toolName: 'get_v1_proposed_negative_statutory_instrument_by_id',
    summary: 'Returns proposed negative statutory instrument by ID.',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'string', description: 'Proposed negative statutory instrument with the ID specified' }],
    queryParams: [],
  },
  {
    path: '/api/v1/ProposedNegativeStatutoryInstrument/{id}/BusinessItems',
    method: 'GET',
    toolName: 'list_v1_business_items_by_proposed_negative_statutory_instrument_id',
    summary: 'Returns business items belonging to a proposed negative statutory instrument.',
    pathParams: [
      {
        name: 'id',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Business items belonging to proposed negative statutory instrument with the ID specified',
      },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/StatutoryInstrument',
    method: 'GET',
    toolName: 'list_v1_statutory_instruments',
    summary: 'Returns a list of statutory instruments.',
    pathParams: [],
    queryParams: [
      { name: 'Name', in: 'query', required: false, type: 'string', description: 'Statutory instruments with the name specified' },
      {
        name: 'StatutoryInstrumentType',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Statutory instruments where the statutory instrument type is the type provided',
        enum: [...SI_TYPE_ENUM],
      },
      { name: 'ScheduledDebate', in: 'query', required: false, type: 'boolean', description: 'Statutory instrument which contains a scheduled debate' },
      { name: 'MotionToStop', in: 'query', required: false, type: 'boolean', description: 'Statutory instruments which contains a motion to stop' },
      {
        name: 'ConcernsRaisedByCommittee',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Statutory instruments which contains concerns raised by committee',
      },
      {
        name: 'ParliamentaryProcessConcluded',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Statutory instruments where the parliamentary process is concluded or notconcluded',
        enum: [...PARLIAMENTARY_PROCESS_ENUM],
      },
      { name: 'DepartmentId', in: 'query', required: false, type: 'number', description: 'Statutory instruments with the department ID specified' },
      { name: 'LayingBodyId', in: 'query', required: false, type: 'string', description: 'Statutory instruments with the laying body ID specified' },
      { name: 'House', in: 'query', required: false, type: 'string', description: 'Statutory instruments laid in the house specified', enum: [...HOUSE_ENUM] },
      { name: 'Skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0' },
      { name: 'Take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 20' },
    ],
  },
  {
    path: '/api/v1/StatutoryInstrument/{id}',
    method: 'GET',
    toolName: 'get_v1_statutory_instrument_by_id',
    summary: 'Returns a statutory instrument by ID.',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'string', description: 'Statutory instrument with the ID specified' }],
    queryParams: [],
  },
  {
    path: '/api/v1/StatutoryInstrument/{id}/BusinessItems',
    method: 'GET',
    toolName: 'list_v1_business_items_by_statutory_instrument_id',
    summary: 'Returns business items belonging to statutory instrument with ID.',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'string', description: 'Business items belonging to statutory instrument with the ID specified' }],
    queryParams: [],
  },
  {
    path: '/api/v2/ActOfParliament',
    method: 'GET',
    toolName: 'list_v2_acts_of_parliament',
    summary: 'Search through Acts of Parliament',
    pathParams: [],
    queryParams: [
      { name: 'Id', in: 'query', required: false, type: 'array:string', description: 'Acts of Parliament with the IDs specified.' },
      { name: 'Name', in: 'query', required: false, type: 'string', description: 'Acts of Parliament with the name specified.' },
    ],
  },
  {
    path: '/api/v2/ActOfParliament/{id}',
    method: 'GET',
    toolName: 'get_v2_act_of_parliament_by_id',
    summary: 'Search individual Act of Parliament by ID',
    pathParams: [{ name: 'id', in: 'path', required: true, type: 'string' }],
    queryParams: [],
  },
  {
    path: '/api/v2/StatutoryInstrument',
    method: 'GET',
    toolName: 'list_v2_statutory_instruments',
    summary: 'Search through statutory instruments and proposed negatives',
    pathParams: [],
    queryParams: [
      { name: 'Name', in: 'query', required: false, type: 'string', description: 'Statutory instruments with the name specified' },
      { name: 'Procedure', in: 'query', required: false, type: 'string', description: 'Statutory instruments made under the specified procedure' },
      { name: 'ScheduledDebate', in: 'query', required: false, type: 'boolean', description: 'Statutory instrument which contains a scheduled debate' },
      { name: 'MotionToStop', in: 'query', required: false, type: 'boolean', description: 'Statutory instruments which contains a motion to stop' },
      {
        name: 'ConcernsRaisedByCommittee',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Statutory instruments which contains concerns raised by committee',
      },
      {
        name: 'ParliamentaryProcessConcluded',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Statutory instruments where the parliamentary process is concluded or notconcluded',
      },
      { name: 'DepartmentId', in: 'query', required: false, type: 'number', description: 'Statutory instruments with the department ID specified' },
      { name: 'LayingBodyId', in: 'query', required: false, type: 'string', description: 'Statutory instruments with the laying body ID specified' },
      {
        name: 'RecommendedForProcedureChange',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Statutory instruments recommended for procedure change',
      },
      { name: 'ActOfParliamentId', in: 'query', required: false, type: 'array:string', description: 'Statutory instruments with the Act of Parliament ID specified' },
      { name: 'House', in: 'query', required: false, type: 'string', description: 'Statutory instruments laid in the house specified', enum: [...HOUSE_ENUM] },
      { name: 'Skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0' },
      { name: 'Take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 20' },
    ],
  },
  {
    path: '/api/v2/StatutoryInstrument/{instrumentId}',
    method: 'GET',
    toolName: 'get_v2_statutory_instrument_by_instrument_id',
    summary: 'Get individual statutory instrument or proposed negative by id',
    pathParams: [{ name: 'instrumentId', in: 'path', required: true, type: 'string', description: 'Id of instrument requested' }],
    queryParams: [],
  },
  {
    path: '/api/v2/StatutoryInstrument/{instrumentId}/BusinessItems',
    method: 'GET',
    toolName: 'list_v2_business_items_by_instrument_id',
    summary: 'Get business items associated with a particular instrument',
    pathParams: [{ name: 'instrumentId', in: 'path', required: true, type: 'string', description: 'Id of instrument to get business items for' }],
    queryParams: [],
  },
  {
    path: '/api/v2/Timeline/{timelineId}/BusinessItems',
    method: 'GET',
    toolName: 'list_v2_business_items_by_timeline_id',
    summary: 'Get business items associated with a particular timeline',
    pathParams: [{ name: 'timelineId', in: 'path', required: true, type: 'string', description: 'Id of timeline to get business items for' }],
    queryParams: [],
  },
];

export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint]));

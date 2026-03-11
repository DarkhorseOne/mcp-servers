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

export const ENDPOINTS: EndpointDefinition[] = [
  {
    path: '/data/division/{divisionId}.{format}',
    method: 'GET',
    toolName: 'ukpcv_division_get_by_id',
    summary: 'Return a Division',
    pathParams: [
      {
        name: 'divisionId',
        in: 'path',
        required: true,
        type: 'number',
        description: 'Id number of a Division whose records are to be returned',
      },
      {
        name: 'format',
        in: 'path',
        required: true,
        type: 'string',
        description: 'xml or json',
      },
    ],
    queryParams: [],
  },
  {
    path: '/data/divisions.{format}/groupedbyparty',
    method: 'GET',
    toolName: 'ukpcv_divisions_grouped_by_party',
    summary: 'Return Divisions results grouped by party',
    pathParams: [
      {
        name: 'format',
        in: 'path',
        required: true,
        type: 'string',
        description: 'xml or json',
      },
    ],
    queryParams: [
      {
        name: 'queryParameters.searchTerm',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions containing search term within title or number',
      },
      {
        name: 'queryParameters.memberId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Divisions returning Member with Member ID voting records',
      },
      {
        name: 'queryParameters.includeWhenMemberWasTeller',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Divisions where member was a teller as well as if they actually voted',
      },
      {
        name: 'queryParameters.startDate',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions where division date in one or after date provided. Date format is yyyy-MM-dd',
      },
      {
        name: 'queryParameters.endDate',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions where division date in one or before date provided. Date format is yyyy-MM-dd',
      },
      {
        name: 'queryParameters.divisionNumber',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Division Number - as specified by the House, unique within a session. This is different to the division id which uniquely identifies a division in this system and is passed to the GET division endpoint',
      },
    ],
  },
  {
    path: '/data/divisions.{format}/membervoting',
    method: 'GET',
    toolName: 'ukpcv_divisions_member_voting',
    summary: 'Return voting records for a Member',
    pathParams: [
      {
        name: 'format',
        in: 'path',
        required: true,
        type: 'string',
        description: 'xml or json',
      },
    ],
    queryParams: [
      {
        name: 'queryParameters.memberId',
        in: 'query',
        required: true,
        type: 'number',
        description: 'Id number of a Member whose voting records are to be returned',
      },
      {
        name: 'queryParameters.skip',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to skip. Default is 0',
      },
      {
        name: 'queryParameters.take',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to return per page. Default is 25',
      },
      {
        name: 'queryParameters.searchTerm',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions containing search term within title or number',
      },
      {
        name: 'queryParameters.includeWhenMemberWasTeller',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Divisions where member was a teller as well as if they actually voted',
      },
      {
        name: 'queryParameters.startDate',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions where division date in one or after date provided. Date format is yyyy-MM-dd',
      },
      {
        name: 'queryParameters.endDate',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions where division date in one or before date provided. Date format is yyyy-MM-dd',
      },
      {
        name: 'queryParameters.divisionNumber',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Division Number - as specified by the House, unique within a session. This is different to the division id which uniquely identifies a division in this system and is passed to the GET division endpoint',
      },
    ],
  },
  {
    path: '/data/divisions.{format}/search',
    method: 'GET',
    toolName: 'ukpcv_divisions_search',
    summary: 'Return a list of Divisions',
    pathParams: [
      {
        name: 'format',
        in: 'path',
        required: true,
        type: 'string',
        description: 'json or xml',
      },
    ],
    queryParams: [
      {
        name: 'queryParameters.skip',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to skip. Default is 0',
      },
      {
        name: 'queryParameters.take',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to return per page. Default is 25',
      },
      {
        name: 'queryParameters.searchTerm',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions containing search term within title or number',
      },
      {
        name: 'queryParameters.memberId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Divisions returning Member with Member ID voting records',
      },
      {
        name: 'queryParameters.includeWhenMemberWasTeller',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Divisions where member was a teller as well as if they actually voted',
      },
      {
        name: 'queryParameters.startDate',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions where division date in one or after date provided. Date format is yyyy-MM-dd',
      },
      {
        name: 'queryParameters.endDate',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions where division date in one or before date provided. Date format is yyyy-MM-dd',
      },
      {
        name: 'queryParameters.divisionNumber',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Division Number - as specified by the House, unique within a session. This is different to the division id which uniquely identifies a division in this system and is passed to the GET division endpoint',
      },
    ],
  },
  {
    path: '/data/divisions.{format}/searchTotalResults',
    method: 'GET',
    toolName: 'ukpcv_divisions_search_total_results',
    summary: 'Return total results count',
    pathParams: [
      {
        name: 'format',
        in: 'path',
        required: true,
        type: 'string',
        description: 'json or xml',
      },
    ],
    queryParams: [
      {
        name: 'queryParameters.searchTerm',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions containing search term within title or number',
      },
      {
        name: 'queryParameters.memberId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Divisions returning Member with Member ID voting records',
      },
      {
        name: 'queryParameters.includeWhenMemberWasTeller',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Divisions where member was a teller as well as if they actually voted',
      },
      {
        name: 'queryParameters.startDate',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions where division date in one or after date provided. Date format is yyyy-MM-dd',
      },
      {
        name: 'queryParameters.endDate',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Divisions where division date in one or before date provided. Date format is yyyy-MM-dd',
      },
      {
        name: 'queryParameters.divisionNumber',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Division Number - as specified by the House, unique within a session. This is different to the division id which uniquely identifies a division in this system and is passed to the GET division endpoint',
      },
    ],
  },
];

export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint] as const));

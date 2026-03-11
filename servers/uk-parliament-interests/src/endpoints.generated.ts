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
    path: '/api/v1/Categories',
    method: 'GET',
    toolName: 'ukpi_categories_list',
    summary: 'Return a list of categories interests should be registered under, sorted by category number.',
    pathParams: [],
    queryParams: [
      {
        name: 'Skip',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to skip from the first, default is 0.',
      },
      {
        name: 'Take',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to return, default is 20.',
      },
    ],
  },
  {
    path: '/api/v1/Categories/{id}',
    method: 'GET',
    toolName: 'ukpi_categories_get_by_id',
    summary: 'Return details of an interest category by ID.',
    pathParams: [
      {
        name: 'id',
        in: 'path',
        required: true,
        type: 'number',
        description: 'ID of the category.',
      },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/Interests',
    method: 'GET',
    toolName: 'ukpi_interests_list',
    summary: 'Return a list of interests that have been published on a register.',
    pathParams: [],
    queryParams: [
      {
        name: 'MemberId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Search for an interest created by member with this ID.',
      },
      {
        name: 'CategoryId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Search for an interest within a specific category with this ID.',
      },
      {
        name: 'PublishedFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest published on or after this date.',
      },
      {
        name: 'PublishedTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest published on or before this date.',
      },
      {
        name: 'RegisteredFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest registered on or after this date.',
      },
      {
        name: 'RegisteredTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest registered on or before this date.',
      },
      {
        name: 'UpdatedFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest which has any updates on or after this date.',
      },
      {
        name: 'UpdatedTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest which has any updates on or before this date.',
      },
      {
        name: 'RegisterId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Search for an interest published in a register with this ID. If not provided, default value is latest register ID.',
      },
      {
        name: 'ExpandChildInterests',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'If true returns related interests in a nested format, rather than as individual items.',
      },
      {
        name: 'Take',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to return, default is 20. Maximum is 20.',
      },
      {
        name: 'SortOrder',
        in: 'query',
        required: false,
        type: 'string',
        description: 'The order in which to return records.',
        enum: ['PublishingDateDescending', 'CategoryAscending'],
      },
      {
        name: 'Skip',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to skip from the first, default is 0.',
      },
    ],
  },
  {
    path: '/api/v1/Interests/csv',
    method: 'GET',
    toolName: 'ukpi_interests_csv',
    summary: 'Return interests that have been published on a register as a collection of CSVs packaged in a ZIP file.',
    pathParams: [],
    queryParams: [
      {
        name: 'MemberId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Search for an interest created by member with this ID.',
      },
      {
        name: 'CategoryId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Search for an interest with associated category with this ID.',
      },
      {
        name: 'PublishedFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest published on or after this date.',
      },
      {
        name: 'PublishedTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest published on or before this date.',
      },
      {
        name: 'RegisteredFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest registered on or after this date.',
      },
      {
        name: 'RegisteredTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest registered on or before this date.',
      },
      {
        name: 'UpdatedFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest which has any updates on or after this date.',
      },
      {
        name: 'UpdatedTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Search for an interest which has any updates on or before this date.',
      },
      {
        name: 'RegisterId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Search for an interest published in a register with this ID. If not provided, default value is latest register ID.',
      },
      {
        name: 'IncludeFieldDescriptions',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Returns a metadata file for each category, containing a list of fields which are available for a member to add further information about the interest.',
      },
    ],
  },
  {
    path: '/api/v1/Interests/{id}',
    method: 'GET',
    toolName: 'ukpi_interests_get_by_id',
    summary: 'Return the latest version of an interest which has been published.',
    pathParams: [
      {
        name: 'id',
        in: 'path',
        required: true,
        type: 'number',
        description: 'ID of the interest.',
      },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/Registers',
    method: 'GET',
    toolName: 'ukpi_registers_list',
    summary: 'Return a list of published versions of registers of interests.',
    pathParams: [],
    queryParams: [
      {
        name: 'SessionId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Search for registers published within a parliamentary session with this ID. Find session data at https://whatson-api.parliament.uk/.',
      },
      {
        name: 'Skip',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to skip from the first, default is 0.',
      },
      {
        name: 'Take',
        in: 'query',
        required: false,
        type: 'number',
        description: 'The number of records to return, default is 20.',
      },
    ],
  },
  {
    path: '/api/v1/Registers/{id}',
    method: 'GET',
    toolName: 'ukpi_registers_get_by_id',
    summary: 'Return a published version of a register of interests by ID.',
    pathParams: [
      {
        name: 'id',
        in: 'path',
        required: true,
        type: 'number',
        description: 'ID of the register.',
      },
    ],
    queryParams: [],
  },
  {
    path: '/api/v1/Registers/{id}/document',
    method: 'GET',
    toolName: 'ukpi_registers_document',
    summary: 'Return a published register as a PDF document by ID.',
    pathParams: [
      {
        name: 'id',
        in: 'path',
        required: true,
        type: 'number',
        description: 'ID of the register.',
      },
    ],
    queryParams: [
      {
        name: 'type',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Whether to return a document containing the full register or only updates. Default value is Full.',
        enum: ['Full', 'Updated'],
      },
    ],
  },
];

export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint] as const));

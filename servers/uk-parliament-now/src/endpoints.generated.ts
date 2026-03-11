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

const ANNUNCIATOR_MESSAGE_TYPE_ENUM = ['CommonsMain', 'LordsMain'] as const;

export const ENDPOINTS: EndpointDefinition[] = [
  {
    path: '/api/Message/message/{annunciator}/current',
    method: 'GET',
    toolName: 'get_current_message_by_annunciator',
    summary: 'Return the current message by annunciator type',
    pathParams: [
      {
        name: 'annunciator',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Current message by annunciator',
        enum: [...ANNUNCIATOR_MESSAGE_TYPE_ENUM],
      },
    ],
    queryParams: [],
  },
  {
    path: '/api/Message/message/{annunciator}/{date}',
    method: 'GET',
    toolName: 'get_latest_message_by_annunciator_and_date',
    summary: 'Return the most recent message by annunciator after date time specified',
    pathParams: [
      {
        name: 'annunciator',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Message by annunciator type',
        enum: [...ANNUNCIATOR_MESSAGE_TYPE_ENUM],
      },
      {
        name: 'date',
        in: 'path',
        required: true,
        type: 'string',
        description: 'First message after date time specified',
      },
    ],
    queryParams: [],
  },
];

export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint]));

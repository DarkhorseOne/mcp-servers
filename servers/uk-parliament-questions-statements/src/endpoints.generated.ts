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

const HOUSE_ENUM = ['Bicameral', 'Commons', 'Lords'] as const;
const ANSWERED_ENUM = ['Any', 'Answered', 'Unanswered'] as const;
const QUESTION_STATUS_ENUM = ['NotAnswered', 'AnsweredOnly', 'AllQuestions'] as const;
const SESSION_STATUS_ENUM = ['Current', 'Any'] as const;
export const ENDPOINTS: EndpointDefinition[] = [
  {
    path: '/api/dailyreports/dailyreports',
    method: 'GET',
    toolName: 'list_daily_reports',
    summary: 'Returns a list of daily reports',
    pathParams: [],
    queryParams: [
      {
        name: 'dateFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Daily report with report date on or after the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'dateTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Daily report with report date on or before the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'house',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Daily report relating to the House specified. Defaults to Bicameral',
        enum: [...HOUSE_ENUM],
      },
      {
        name: 'skip',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Number of records to skip, default is 0',
      },
      {
        name: 'take',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Number of records to take, default is 20',
      },
    ],
  },
  {
    path: '/api/writtenquestions/questions',
    method: 'GET',
    toolName: 'list_written_questions',
    summary: 'Returns a list of written questions',
    pathParams: [],
    queryParams: [
      {
        name: 'askingMemberId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Written questions asked by member with member ID specified',
      },
      {
        name: 'answeringMemberId',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Written questions answered by member with member ID specified',
      },
      {
        name: 'tabledWhenFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions tabled on or after the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'dateForAnswerWhenFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions DateForAnswer on or after the date specified format yyyy-mm-dd',
      },
      {
        name: 'dateForAnswerWhenTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions DateForAnswer on or before the date specified format yyyy-mm-dd',
      },
      {
        name: 'tabledWhenTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions tabled on or before the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'answered',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions that have been answered, unanswered or either.',
        enum: [...ANSWERED_ENUM],
      },
      {
        name: 'answeredWhenFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions answered on or after the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'answeredWhenTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions answered on or before the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'questionStatus',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions with the status specified',
        enum: [...QUESTION_STATUS_ENUM],
      },
      {
        name: 'includeWithdrawn',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Include written questions that have been withdrawn',
      },
      {
        name: 'expandMember',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Expand the details of Members in the results',
      },
      {
        name: 'correctedWhenFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions corrected on or after the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'correctedWhenTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions corrected on or before the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'sessionStatus',
        in: 'query',
        required: false,
        type: 'string',
        description: 'The Session status for which the Questions data will be returned',
        enum: [...SESSION_STATUS_ENUM],
      },
      {
        name: 'searchTerm',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions / statements containing the search term specified, searches item content',
      },
      {
        name: 'uIN',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions / statements with the uin specified',
      },
      {
        name: 'answeringBodies',
        in: 'query',
        required: false,
        type: 'array:number',
        description: 'Written questions / statements relating to the answering bodies with the IDs specified',
      },
      {
        name: 'members',
        in: 'query',
        required: false,
        type: 'array:number',
        description: 'Written questions / statements relating to the members with the IDs specified',
      },
      {
        name: 'house',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions / statements relating to the House specified',
        enum: [...HOUSE_ENUM],
      },
      {
        name: 'skip',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Number of records to skip, default is 0',
      },
      {
        name: 'take',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Number of records to take, default is 20',
      },
    ],
  },
  {
    path: '/api/writtenquestions/questions/{id}',
    method: 'GET',
    toolName: 'get_written_question_by_id',
    summary: 'Returns a written question',
    pathParams: [
      {
        name: 'id',
        in: 'path',
        required: true,
        type: 'number',
        description: 'written question with ID specified',
      },
    ],
    queryParams: [
      {
        name: 'expandMember',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Expand the details of Members in the result',
      },
      {
        name: 'sessionStatus',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Session status to get the Questions data for',
        enum: [...SESSION_STATUS_ENUM],
      },
    ],
  },
  {
    path: '/api/writtenquestions/questions/{date}/{uin}',
    method: 'GET',
    toolName: 'get_written_question_by_date_and_uin',
    summary: 'Returns a written question',
    pathParams: [
      {
        name: 'date',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Written question on date specified',
      },
      {
        name: 'uin',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Written question with uid specified',
      },
    ],
    queryParams: [
      {
        name: 'expandMember',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Expand the details of Members in the results',
      },
      {
        name: 'sessionStatus',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Session status to get the Questions data for',
        enum: [...SESSION_STATUS_ENUM],
      },
    ],
  },
  {
    path: '/api/writtenstatements/statements',
    method: 'GET',
    toolName: 'list_written_statements',
    summary: 'Returns a list of written statements',
    pathParams: [],
    queryParams: [
      {
        name: 'madeWhenFrom',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written statements made on or after the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'madeWhenTo',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written statements made on or before the date specified. Date format yyyy-mm-dd',
      },
      {
        name: 'sessionStatus',
        in: 'query',
        required: false,
        type: 'string',
        description: 'The Session status for which the Written statements data will be returned',
        enum: [...SESSION_STATUS_ENUM],
      },
      {
        name: 'searchTerm',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions / statements containing the search term specified, searches item content',
      },
      {
        name: 'uIN',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions / statements with the uin specified',
      },
      {
        name: 'answeringBodies',
        in: 'query',
        required: false,
        type: 'array:number',
        description: 'Written questions / statements relating to the answering bodies with the IDs specified',
      },
      {
        name: 'members',
        in: 'query',
        required: false,
        type: 'array:number',
        description: 'Written questions / statements relating to the members with the IDs specified',
      },
      {
        name: 'house',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Written questions / statements relating to the House specified',
        enum: [...HOUSE_ENUM],
      },
      {
        name: 'skip',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Number of records to skip, default is 0',
      },
      {
        name: 'take',
        in: 'query',
        required: false,
        type: 'number',
        description: 'Number of records to take, default is 20',
      },
      {
        name: 'expandMember',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Expand the details of Members in the results',
      },
    ],
  },
  {
    path: '/api/writtenstatements/statements/{id}',
    method: 'GET',
    toolName: 'get_written_statement_by_id',
    summary: 'Returns a written statement',
    pathParams: [
      {
        name: 'id',
        in: 'path',
        required: true,
        type: 'number',
        description: 'Written statement with ID specified',
      },
    ],
    queryParams: [
      {
        name: 'expandMember',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Expand the details of Members in the results',
      },
      {
        name: 'sessionStatus',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Session status to filter the Written statement records',
        enum: [...SESSION_STATUS_ENUM],
      },
    ],
  },
  {
    path: '/api/writtenstatements/statements/{date}/{uin}',
    method: 'GET',
    toolName: 'get_written_statement_by_date_and_uin',
    summary: 'Returns a written statemnet',
    pathParams: [
      {
        name: 'date',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Written statement on date specified',
      },
      {
        name: 'uin',
        in: 'path',
        required: true,
        type: 'string',
        description: 'Written statement with uid specified',
      },
    ],
    queryParams: [
      {
        name: 'expandMember',
        in: 'query',
        required: false,
        type: 'boolean',
        description: 'Expand the details of Members in the results',
      },
      {
        name: 'sessionStatus',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Session status to filter the Written statement records',
        enum: [...SESSION_STATUS_ENUM],
      },
    ],
  },
];

export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint]));

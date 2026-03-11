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
    path: '/EarlyDayMotion/{id}',
    method: 'GET',
    toolName: 'get_early_day_motion_by_id',
    summary: 'Returns a single Early Day Motion by ID',
    pathParams: [
      {
        name: 'id',
        in: 'path',
        required: true,
        type: 'number',
        description: 'Early Day Motion with the ID specified.',
      },
    ],
    queryParams: [],
  },
  {
    path: '/EarlyDayMotions/list',
    method: 'GET',
    toolName: 'list_early_day_motions',
    summary: 'Returns a list of Early Day Motions',
    pathParams: [],
    queryParams: [
      { name: 'parameters.edmIds', in: 'query', required: false, type: 'array:number', description: 'Early Day Motions with an ID in the list provided.' },
      { name: 'parameters.uINWithAmendmentSuffix', in: 'query', required: false, type: 'string', description: 'Early Day Motions with an UINWithAmendmentSuffix provided.' },
      { name: 'parameters.searchTerm', in: 'query', required: false, type: 'string', description: 'Early Day Motions where the title includes the search term provided.' },
      { name: 'parameters.currentStatusDateStart', in: 'query', required: false, type: 'string', description: 'Early Day Motions where the current status has been set on or after the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.currentStatusDateEnd', in: 'query', required: false, type: 'string', description: 'Early Day Motions where the current status has been set on or before the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.isPrayer', in: 'query', required: false, type: 'boolean', description: 'Early Day Motions which are a prayer against a Negative Statutory Instrument.' },
      { name: 'parameters.memberId', in: 'query', required: false, type: 'number', description: 'Return Early Day Motions tabled by Member with ID provided.' },
      { name: 'parameters.includeSponsoredByMember', in: 'query', required: false, type: 'boolean', description: 'Include Early Day Motions sponsored by Member specified' },
      { name: 'parameters.tabledStartDate', in: 'query', required: false, type: 'string', description: 'Early Day Motions where the date tabled is on or after the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.tabledEndDate', in: 'query', required: false, type: 'string', description: 'Early Day Motions where the date tabled is on or before the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.statuses', in: 'query', required: false, type: 'array:string', description: 'Early Day Motions where current status is in the selected list.', enum: ['Published', 'Withdrawn'] },
      {
        name: 'parameters.orderBy',
        in: 'query',
        required: false,
        type: 'string',
        description: 'Order results by date tabled, title or signature count. Default is date tabled.',
        enum: ['DateTabledAsc', 'DateTabledDesc', 'TitleAsc', 'TitleDesc', 'SignatureCountAsc', 'SignatureCountDesc'],
      },
      { name: 'parameters.skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0.' },
      { name: 'parameters.take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 25, maximum is 100.' },
    ],
  },
  {
    path: '/oralquestions/list',
    method: 'GET',
    toolName: 'list_oral_questions',
    summary: 'Returns a list of oral questions',
    pathParams: [],
    queryParams: [
      { name: 'parameters.answeringDateStart', in: 'query', required: false, type: 'string', description: 'Oral Questions where the answering date has been set on or after the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.answeringDateEnd', in: 'query', required: false, type: 'string', description: 'Oral Questions where the answering date has been set on or before the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.questionType', in: 'query', required: false, type: 'string', description: 'Oral Questions where the question type is the selected type, substantive or topical.', enum: ['Substantive', 'Topical'] },
      { name: 'parameters.oralQuestionTimeId', in: 'query', required: false, type: 'number', description: 'Oral Questions where the question is within the question time with the ID provided' },
      {
        name: 'parameters.statuses',
        in: 'query',
        required: false,
        type: 'array:string',
        description: 'Oral Questions where current status is in the selected list',
        enum: ['Submitted', 'Carded', 'Unsaved', 'ReadyForShuffle', 'ToBeAsked', 'ShuffleUnsuccessful', 'Withdrawn', 'Unstarred', 'Draft', 'ForReview', 'Unasked', 'Transferred'],
      },
      {
        name: 'parameters.askingMemberIds',
        in: 'query',
        required: false,
        type: 'array:number',
        description:
          'The ID of the member asking the question. Lists of member IDs for each house are available <a href="http://data.parliament.uk/membersdataplatform/services/mnis/members/query/house=Commons" target="_blank">Commons</a> and <a href="http://data.parliament.uk/membersdataplatform/services/mnis/members/query/house=Lords" target="_blank">Lords</a>.',
      },
      { name: 'parameters.uINs', in: 'query', required: false, type: 'array:number', description: 'The UIN for the question - note that UINs reset at the start of each Parliamentary session.' },
      {
        name: 'parameters.answeringBodyIds',
        in: 'query',
        required: false,
        type: 'array:number',
        description:
          'Which answering body is to respond. A list of answering bodies can be found <a target="_blank" href="http://data.parliament.uk/membersdataplatform/services/mnis/referencedata/AnsweringBodies/">here</a>.',
      },
      { name: 'parameters.skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0.' },
      { name: 'parameters.take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 25, maximum is 100.' },
    ],
  },
  {
    path: '/oralquestiontimes/list',
    method: 'GET',
    toolName: 'list_oral_question_times',
    summary: 'Returns a list of oral question times',
    pathParams: [],
    queryParams: [
      { name: 'parameters.answeringDateStart', in: 'query', required: false, type: 'string', description: 'Oral Questions Time where the answering date has been set on or after the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.answeringDateEnd', in: 'query', required: false, type: 'string', description: 'Oral Questions Time where the answering date has been set on or before the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.deadlineDateStart', in: 'query', required: false, type: 'string', description: 'Oral Questions Time where the deadline date has been set on or after the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.deadlineDateEnd', in: 'query', required: false, type: 'string', description: 'Oral Questions Time where the deadline date has been set on or before the date provided. Date format YYYY-MM-DD.' },
      { name: 'parameters.oralQuestionTimeId', in: 'query', required: false, type: 'number', description: 'Identifier of the OQT' },
      {
        name: 'parameters.answeringBodyIds',
        in: 'query',
        required: false,
        type: 'array:number',
        description:
          'Which answering body is to respond. A list of answering bodies can be found <a target="_blank" href="http://data.parliament.uk/membersdataplatform/services/mnis/referencedata/AnsweringBodies/">here</a>.',
      },
      { name: 'parameters.skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0.' },
      { name: 'parameters.take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 25, maximum is 100.' },
    ],
  },
];

export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint]));

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
    path: '/api/Chapter/{chapterNumber}',
    method: 'GET',
    toolName: 'get_chapter_by_chapter_number',
    summary: 'Returns a single chapter overview by chapter number.',
    pathParams: [{ name: 'chapterNumber', in: 'path', required: true, type: 'number', description: 'Chapter overview with the chapter number specified' }],
    queryParams: [],
  },
  {
    path: '/api/IndexTerm/browse',
    method: 'GET',
    toolName: 'browse_index_terms',
    summary: 'Returns a list of index terms by start letter.',
    pathParams: [],
    queryParams: [
      { name: 'startLetter', in: 'query', required: false, type: 'string', description: 'Index terms by start letter' },
      { name: 'skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0.' },
      { name: 'take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 20, maximum is 20.' },
    ],
  },
  {
    path: '/api/IndexTerm/{indexTermId}',
    method: 'GET',
    toolName: 'get_index_term_by_index_term_id',
    summary: 'Returns an index term by id.',
    pathParams: [{ name: 'indexTermId', in: 'path', required: true, type: 'number', description: 'Index term by if' }],
    queryParams: [],
  },
  {
    path: '/api/Part',
    method: 'GET',
    toolName: 'list_parts',
    summary: 'Returns a list of all parts.',
    pathParams: [],
    queryParams: [],
  },
  {
    path: '/api/Part/{partNumber}',
    method: 'GET',
    toolName: 'get_part_by_part_number',
    summary: 'Returns a part by part number.',
    pathParams: [{ name: 'partNumber', in: 'path', required: true, type: 'number', description: 'Part by part number' }],
    queryParams: [],
  },
  {
    path: '/api/Search/IndexTermSearchResults/{searchTerm}',
    method: 'GET',
    toolName: 'search_index_term_results_by_search_term',
    summary: 'Returns a list of index terms which contain the search term.',
    pathParams: [{ name: 'searchTerm', in: 'path', required: true, type: 'string', description: 'Index terms which contain search term.' }],
    queryParams: [
      { name: 'skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0.' },
      { name: 'take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 20, maximum is 20.' },
    ],
  },
  {
    path: '/api/Search/Paragraph/{reference}',
    method: 'GET',
    toolName: 'get_paragraph_by_reference',
    summary: 'Returns a section overview by reference.',
    pathParams: [{ name: 'reference', in: 'path', required: true, type: 'string', description: 'Section overview by reference.' }],
    queryParams: [],
  },
  {
    path: '/api/Search/ParagraphSearchResults/{searchTerm}',
    method: 'GET',
    toolName: 'search_paragraph_results_by_search_term',
    summary: 'Returns a list of paragraphs which contain the search term.',
    pathParams: [{ name: 'searchTerm', in: 'path', required: true, type: 'string', description: 'Paragraphs which contain search term in their content.' }],
    queryParams: [
      { name: 'skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0.' },
      { name: 'take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 20, maximum is 20.' },
    ],
  },
  {
    path: '/api/Search/SectionSearchResults/{searchTerm}',
    method: 'GET',
    toolName: 'search_section_results_by_search_term',
    summary: 'Returns a list of sections which contain the search term.',
    pathParams: [{ name: 'searchTerm', in: 'path', required: true, type: 'string', description: 'Sections which contain search term in their title.' }],
    queryParams: [
      { name: 'skip', in: 'query', required: false, type: 'number', description: 'The number of records to skip from the first, default is 0.' },
      { name: 'take', in: 'query', required: false, type: 'number', description: 'The number of records to return, default is 20, maximum is 20.' },
    ],
  },
  {
    path: '/api/Section/{sectionId}',
    method: 'GET',
    toolName: 'get_section_by_section_id',
    summary: 'Returns a section by section id.',
    pathParams: [{ name: 'sectionId', in: 'path', required: true, type: 'number', description: 'Section by id.' }],
    queryParams: [],
  },
  {
    path: '/api/Section/{sectionId},{step}',
    method: 'GET',
    toolName: 'get_section_overview_by_section_id_and_step',
    summary: 'Returns a section overview by section id and step.',
    pathParams: [
      { name: 'sectionId', in: 'path', required: true, type: 'number', description: 'Section by id.' },
      { name: 'step', in: 'path', required: true, type: 'number', description: 'Number of sections to step over from given section.' },
    ],
    queryParams: [],
  },
];

export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint]));

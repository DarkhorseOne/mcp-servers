# search_questions

## Purpose
Search parliamentary written questions, with optional MP and department filtering.

## Technical implementation details
- Tool name: `search_questions`
- Source: `gov_uk_mcp/tools/parliamentary_questions.py`
- Upstream API:
  - Base URL: `https://questions-statements-api.parliament.uk/api`
  - Endpoint: `/writtenquestions/questions`
  - Method: `GET`
  - Query params:
    - `searchTerm`
    - `take` (from `limit`)
    - `skip=0`
    - optional `askingMemberId` (resolved from `mp_name`)
    - optional `answeringBodyName` (from `department`)
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - If `mp_name` is provided, tool calls `find_mp(mp_name)` to resolve a single MP ID
  - Multiple MP matches return `{"error": "Multiple MPs found. Please be more specific."}`
- Validation and normalization:
  - No direct `InputValidator` call in this tool
- Error handling:
  - Propagates `find_mp` error object if present
  - No results returns message
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps `results[].value` to `id`, `date_tabled`, `question_text`, `asking_member`, `answering_body`, `answer_text`, `answer_date`, `uin`
  - Adds `query`, `total_results`, `showing`, `questions`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://questions-statements-api.parliament.uk/api>
- Endpoint used by implementation: <https://questions-statements-api.parliament.uk/api/writtenquestions/questions>

## TypeScript example
```ts
type ToolError = { error: string }

function isToolError(value: unknown): value is ToolError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as { error: unknown }).error === 'string'
  )
}

async function example(client: {
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>
}) {
  const result = await client.callTool('search_questions', {
    query: 'NHS staffing',
    mp_name: 'Keir Starmer'
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

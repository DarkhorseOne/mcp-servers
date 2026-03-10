# get_questions_by_mp

## Purpose
Fetch recent written questions asked by one MP.

## Technical implementation details
- Tool name: `get_questions_by_mp`
- Source: `gov_uk_mcp/tools/parliamentary_questions.py`
- Upstream API:
  - Base URL: `https://questions-statements-api.parliament.uk/api`
  - Endpoint: `/writtenquestions/questions`
  - Method: `GET`
  - Query params: `askingMemberId`, `take` (limit), `skip=0`
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - Resolves MP via `find_mp(mp_name)` first
  - Requires a single match
- Validation and normalization:
  - No direct `InputValidator` call
- Error handling:
  - Propagates `find_mp` error if present
  - Multiple MP match returns explicit ambiguity error
  - No questions found returns message
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps `results[].value` to question fields: `id`, `date_tabled`, `question_text`, `answering_body`, `answer_text`, `answer_date`, `uin`
  - Adds `mp_name`, `mp_id`, `total_results`, `showing`, `questions`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://questions-statements-api.parliament.uk/api>

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
  const result = await client.callTool('get_questions_by_mp', {
    mp_name: 'Keir Starmer',
    limit: 10
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

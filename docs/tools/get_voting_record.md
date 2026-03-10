# get_voting_record

## Purpose
Return voting record data for an MP, either recent history or a specific division.

## Technical implementation details
- Tool name: `get_voting_record`
- Source: `gov_uk_mcp/tools/voting.py`
- Upstream API:
  - Base URL: `https://commonsvotes-api.parliament.uk/data`
  - Endpoints:
    - `/division/{division_id}.json`
    - `/divisions.json/search`
  - Method: `GET`
  - Query params:
    - recent mode: `take=min(limit*3, 100)` on `/divisions.json/search`
    - specific mode: none
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - `mp_name_or_id` accepts MP name or numeric ID
  - Name path resolves MP via `gov_uk_mcp.tools.mps._find_mp_impl`
  - If `division_id` provided, checks vote in one division
  - Else loads recent divisions and concurrently fetches division detail docs using `ThreadPoolExecutor(max_workers=10)`
- Validation and normalization:
  - No `InputValidator` usage in this module
- Error handling:
  - MP resolution errors are returned as-is
  - Ambiguous MP returns explicit error
  - Division `404` maps to `{"error": "Division not found"}`
  - If MP did not vote in division: explicit error
  - Request errors sanitize via `sanitize_api_error(e)`
  - Division detail helper swallows any exception and returns `None`
- Response mapping:
  - Specific division response includes `division_id`, `title`, `date`, `mp_vote`, counts, `result`, `data_source`, `retrieved_at`
  - Recent mode returns `mp_id`, `total_votes`, sorted `votes`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://commonsvotes-api.parliament.uk/data>

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
  const result = await client.callTool('get_voting_record', {
    mp_name_or_id: 'Keir Starmer',
    limit: 10
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

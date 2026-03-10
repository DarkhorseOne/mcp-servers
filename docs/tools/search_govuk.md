# search_govuk

## Purpose
Search GOV.UK content results by query term.

## Technical implementation details
- Tool name: `search_govuk`
- Source: `gov_uk_mcp/tools/search.py`
- Upstream API:
  - Base URL: `https://www.gov.uk`
  - Endpoint: `/api/search.json`
  - Method: `GET`
  - Query params:
    - `q` from sanitized query
    - `count=min(count, 50)`
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - `query` sanitized with `InputValidator.sanitize_query`
  - `count` is capped at 50
- Validation and normalization:
  - Query sanitizer removes control chars and trims to max length 200
- Error handling:
  - Validation failures return `{"error": str(e)}`
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps each `result` to `title`, `link`, `description`, `public_timestamp`, `format`, `organisation`, `content_purpose_supergroup`
  - Adds `query`, `total_results`, `showing`, `results`, `data_source`, `retrieved_at`

## Official documentation links
- GOV.UK API endpoint used by implementation: <https://www.gov.uk/api/search.json>

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
  const result = await client.callTool('search_govuk', {
    query: 'statutory sick pay',
    count: 10
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

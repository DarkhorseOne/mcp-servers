# search_stops

## Purpose
Search TfL stop points by free-text query and optional mode filter.

## Technical implementation details
- Tool name: `search_stops`
- Source: `gov_uk_mcp/tools/transport.py`
- Upstream API:
  - Base URL: `https://api.tfl.gov.uk`
  - Endpoint: `/StopPoint/Search`
  - Method: `GET`
  - Query params:
    - `query`
    - optional `modes`
    - optional `app_key` from `TFL_API_KEY`
  - Headers: none
  - Timeout: `10` seconds
  - Auth: API key via query param is optional in code
- Input handling:
  - Query is passed directly
  - Modes is passed directly if provided
- Validation and normalization:
  - No validation helper used in this tool
- Error handling:
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps first 20 `matches` to `id`, `name`, `modes`, `zone`, `lat`, `lon`
  - Adds `query`, `total_results`, `showing`, `stops`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://api.tfl.gov.uk>
- API portal: <https://api-portal.tfl.gov.uk/>

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
  const result = await client.callTool('search_stops', {
    query: 'Victoria',
    modes: 'tube,bus'
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

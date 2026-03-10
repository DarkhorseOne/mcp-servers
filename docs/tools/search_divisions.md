# search_divisions

## Purpose
Search parliamentary divisions by keyword.

## Technical implementation details
- Tool name: `search_divisions`
- Source: `gov_uk_mcp/tools/voting.py`
- Upstream API:
  - Base URL: `https://commonsvotes-api.parliament.uk/data`
  - Endpoint: `/divisions.json/search`
  - Method: `GET`
  - Query params: `queryParameters` (query), `take` (limit)
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - Query passed directly
  - Limit passed directly
- Validation and normalization:
  - No `InputValidator` usage in this tool
- Error handling:
  - Empty data returns `{"message": "No divisions found matching your search"}`
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps each division to `division_id`, `title`, `date`, `ayes_count`, `noes_count`, `passed`
  - Adds `query`, `total_results`, `divisions`, `data_source`, `retrieved_at`

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
  const result = await client.callTool('search_divisions', {
    query: 'Education',
    limit: 20
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

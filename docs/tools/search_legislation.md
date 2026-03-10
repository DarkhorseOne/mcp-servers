# search_legislation

## Purpose
Search legislation.gov.uk by keyword.

## Technical implementation details
- Tool name: `search_legislation`
- Source: `gov_uk_mcp/tools/legislation.py`
- Upstream API:
  - Base URL: `https://www.legislation.gov.uk`
  - Endpoint: `/search`
  - Method: `GET`
  - Query params: `q`, `page=1`
  - Headers: `Accept: application/json`
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - `query` passed directly
  - `limit` controls local slicing of results
- Validation and normalization:
  - No `InputValidator` usage in this tool
- Error handling:
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps up to `limit` from `data.results` to: `title`, `type`, `year`, `number`, `url`
  - Adds `query`, `total_results` from `data.totalResults`, `showing`, `results`, `data_source`, `retrieved_at`

## Official documentation links
- Service base used by implementation: <https://www.legislation.gov.uk>
- Endpoint used by implementation: <https://www.legislation.gov.uk/search>

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
  const result = await client.callTool('search_legislation', {
    query: 'data protection',
    limit: 10
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

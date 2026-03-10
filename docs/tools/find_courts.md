# find_courts

## Purpose
Find court or tribunal results by postcode or name.

## Technical implementation details
- Tool name: `find_courts`
- Source: `gov_uk_mcp/tools/courts.py`
- Upstream API:
  - Base URL: `https://www.find-court-tribunal.service.gov.uk`
  - Endpoint: `/search/results.json`
  - Method: `GET`
  - Query params:
    - `postcode` when postcode input is provided
    - `q` when name input is provided
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - At least one of `postcode` or `name` must be provided
  - `postcode` normalized to uppercase with spaces removed
- Validation and normalization:
  - No `InputValidator` call here
- Error handling:
  - Missing both inputs returns `{"error": "Please provide either a postcode or court name"}`
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Handles both list payload and object payload with `results`
  - Returns max 20 items mapped to: `name`, `types`, `address`, `postcode`, `distance`, `dx_number`, `image`, `slug`
  - Adds `total_results`, `showing`, `courts`, `data_source`, `retrieved_at`

## Official documentation links
- Service base used by implementation: <https://www.find-court-tribunal.service.gov.uk>
- Endpoint used by implementation: <https://www.find-court-tribunal.service.gov.uk/search/results.json>

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
  const result = await client.callTool('find_courts', { postcode: 'SW1A 1AA' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

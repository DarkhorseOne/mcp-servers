# search_cqc_providers

## Purpose
Search CQC locations by provider name and or postcode.

## Technical implementation details
- Tool name: `search_cqc_providers`
- Source: `gov_uk_mcp/tools/cqc.py`
- Upstream API:
  - Base URL: `https://api.cqc.org.uk/public/v1`
  - Endpoint: `/locations`
  - Method: `GET`
  - Query params:
    - `partnerId=gov-uk-mcp` always
    - optional `name`
    - optional `postcode` normalized to uppercase without spaces
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none in code
- Input handling:
  - Requires at least one of `name` or `postcode`
- Validation and normalization:
  - Postcode normalization only, no postcode format validation in this tool
- Error handling:
  - Missing both inputs returns explicit error
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Uses `data.locations`
  - Returns first 20 mapped to: `location_id`, `name`, `type`, `address`, `postcode`, `overall_rating`, `inspection_date`
  - Adds `total_results`, `showing`, `providers`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://api.cqc.org.uk/public/v1>
- Endpoint used by implementation: <https://api.cqc.org.uk/public/v1/locations>

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
  const result = await client.callTool('search_cqc_providers', { postcode: 'SW1A 1AA' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

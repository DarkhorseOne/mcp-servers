# find_gp_surgeries

## Purpose
Find nearby GP services for a UK postcode.

## Technical implementation details
- Tool name: `find_gp_surgeries`
- Source: `gov_uk_mcp/tools/nhs.py`
- Upstream APIs:
  1. Postcode geocoding
     - URL: `https://api.postcodes.io/postcodes/{postcode}`
     - Method: `GET`
     - Timeout: `10` seconds
  2. NHS service search
     - Base URL: `https://api.nhs.uk`
     - Endpoint: `/service-search/search`
     - Method: `GET`
     - Query params:
       - `api-version=1`
       - `search=GP`
       - `latitude`, `longitude`
       - `top=10`
     - Timeout: `10` seconds
  - Headers: none in code
  - Auth: none in code
- Input handling:
  - Postcode validated with `InputValidator.validate_uk_postcode`
  - Coordinates fetched before NHS search
- Validation and normalization:
  - Standard postcode normalization from validator (uppercase, trimmed, regex)
- Error handling:
  - Postcode validation error returns `{"error": str(e)}`
  - Postcode `404` returns `{"error": "Postcode not found"}`
  - Non-200 postcode status maps to `{"error": "Invalid postcode"}`
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Returns `search_postcode`, `total_results`, `services` (for GP path), `data_source`, `retrieved_at`
  - Each service maps `name`, `address`, `city`, `postcode`, `phone`, `distance`

## Official documentation links
- NHS API base used by implementation: <https://api.nhs.uk>
- Postcode API used by implementation: <https://api.postcodes.io>

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
  const result = await client.callTool('find_gp_surgeries', { postcode: 'SW1A 1AA' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

# nearest_postcodes

## Purpose
Return nearby postcodes around a UK postcode.

## Technical implementation details
- Tool name: `nearest_postcodes`
- Source: `gov_uk_mcp/tools/postcode.py`
- Upstream API:
  - Base URL: `https://api.postcodes.io`
  - Endpoint: `/postcodes/{postcode}/nearest`
  - Method: `GET`
  - Query params: `limit`
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - Postcode validated with `InputValidator.validate_uk_postcode`
- Validation and normalization:
  - Standard postcode normalization from validator
- Error handling:
  - Validation failures return `{"error": str(e)}`
  - Explicit upstream `404` returns `{"error": "Postcode not found"}`
  - Upstream status field not 200 returns `{"error": "Invalid postcode"}`
  - Other request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps each nearby result to `postcode`, `distance`, `latitude`, `longitude`, `admin_district`
  - Returns `search_postcode`, `nearest_postcodes`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://api.postcodes.io>

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
  const result = await client.callTool('nearest_postcodes', {
    postcode: 'SW1A 1AA',
    limit: 5
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

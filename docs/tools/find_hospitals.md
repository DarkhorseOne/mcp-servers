# find_hospitals

## Purpose
Find nearby hospital services for a UK postcode.

## Technical implementation details
- Tool name: `find_hospitals`
- Source: `gov_uk_mcp/tools/nhs.py`
- Upstream APIs:
  1. Postcode geocoding: `https://api.postcodes.io/postcodes/{postcode}` (`GET`, timeout `10`)
  2. NHS search: `https://api.nhs.uk/service-search/search` (`GET`, timeout `10`)
- NHS query params:
  - `api-version=1`
  - `search=Hospital`
  - `latitude`, `longitude`
  - `top=10`
- Headers: none in code
- Auth: none in code
- Input handling:
  - Uses shared postcode validation and geocode helper from `nhs.py`
- Validation and normalization:
  - Postcode validation via `InputValidator.validate_uk_postcode`
- Error handling:
  - Same behavior as `find_gp_surgeries` for validation/postcode/request errors
  - Request errors sanitize via `sanitize_api_error(e)`
- Response mapping:
  - Returns `search_postcode`, `total_results`, `hospitals`, `data_source`, `retrieved_at`
  - Service fields: `name`, `address`, `city`, `postcode`, `phone`, `distance`

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
  const result = await client.callTool('find_hospitals', { postcode: 'SW1A 1AA' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

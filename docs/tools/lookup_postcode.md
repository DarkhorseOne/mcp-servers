# lookup_postcode

## Purpose
Look up a UK postcode and return geographic and administrative details.

## Technical implementation details
- Tool name: `lookup_postcode`
- Source: `gov_uk_mcp/tools/postcode.py`
- Upstream API:
  - Base URL: `https://api.postcodes.io`
  - Endpoint: `/postcodes/{postcode}`
  - Method: `GET`
  - Query params: none
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - `postcode` validated with `InputValidator.validate_uk_postcode`
- Validation and normalization:
  - Postcode validator uppercases and trims, validates regex format
- Error handling:
  - Validation failures return `{"error": str(e)}`
  - Explicit upstream `404` returns `{"error": "Postcode not found"}`
  - Upstream non-200 status field returns `{"error": "Invalid postcode"}`
  - Other request errors use `sanitize_api_error(e)`
- Response mapping:
  - Returns selected fields from `result` including nested `codes`
  - Adds `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://api.postcodes.io>
- Endpoint used by implementation: <https://api.postcodes.io/postcodes/SW1A%201AA>

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
  const result = await client.callTool('lookup_postcode', { postcode: 'SW1A 1AA' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

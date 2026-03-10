# search_epc_by_postcode

## Purpose
Search domestic EPC certificates for a UK postcode.

## Technical implementation details
- Tool name: `search_epc_by_postcode`
- Source: `gov_uk_mcp/tools/epc.py`
- Upstream API:
  - Base URL: `https://epc.opendatacommunities.org/api/v1`
  - Endpoint: `/domestic/search`
  - Method: `GET`
  - Query params: `postcode` (validated, spaces removed)
  - Headers: `Accept: application/json`
  - Timeout: `10` seconds
  - Auth: HTTP Basic Auth from `EPC_API_KEY`
    - If key contains `:`, split into username and password
    - Otherwise use key as username with empty password
- Input handling:
  - Requires environment variable `EPC_API_KEY`
  - Postcode validated by `InputValidator.validate_uk_postcode`, then spaces removed
- Validation and normalization:
  - Postcode uppercased and regex-validated by validator
- Error handling:
  - Missing API key returns `{"error": "EPC API key not configured"}`
  - Validation failures return `{"error": str(e)}`
  - Explicit `404` maps to `{"error": "No EPCs found for this postcode"}`
  - Empty rows maps to `{"message": "No EPCs found for this postcode"}`
  - Other request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps up to 20 `rows` entries to selected address, rating, efficiency, property, inspection, lodgement, area, and environmental fields
  - Adds `total_results`, `showing`, `certificates`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://epc.opendatacommunities.org/api/v1>
- Public API service reference: <https://epc.opendatacommunities.org/>

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
  const result = await client.callTool('search_epc_by_postcode', { postcode: 'SW1A 1AA' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

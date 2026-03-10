# get_cqc_provider

## Purpose
Get detailed CQC location details and ratings for a single location ID.

## Technical implementation details
- Tool name: `get_cqc_provider`
- Source: `gov_uk_mcp/tools/cqc.py`
- Upstream API:
  - Base URL: `https://api.cqc.org.uk/public/v1`
  - Endpoint: `/locations/{location_id}`
  - Method: `GET`
  - Query params: `partnerId=gov-uk-mcp`
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none in code
- Input handling:
  - `location_id` validated by `InputValidator.validate_cqc_location_id`
  - Validation rule: uppercase/trimmed, regex `^[A-Z0-9\-]{1,20}$`, max length 20
- Validation and normalization:
  - Uppercase normalization via validator
- Error handling:
  - Validation failures return `{"error": str(e)}`
  - Explicit `404` maps to `{"error": "Provider not found"}`
  - Other request errors use `sanitize_api_error(e)`
- Response mapping:
  - Returns `location_id`, `name`, `type`, nested `address`, `phone`, `overall_rating`, nested category `ratings`, `inspection_date`, `registration_status`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://api.cqc.org.uk/public/v1>

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
  const result = await client.callTool('get_cqc_provider', { location_id: '1-123456789' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

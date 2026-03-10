# get_charity

## Purpose
Get detailed Charity Commission record data for a single charity number.

## Technical implementation details
- Tool name: `get_charity`
- Source: `gov_uk_mcp/tools/charity.py`
- Upstream API:
  - Base URL: `https://register-of-charities.charitycommission.gov.uk/api`
  - Endpoint: `/charity/{charity_number}`
  - Method: `GET`
  - Query params: none
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - `charity_number` validated by `_validate_charity_number`
  - Accepted formats in code regex:
    - `SC\d{6}`
    - `NIC\d+`
    - `\d{6,8}` with optional `-suffix`
  - Max length 15, uppercased and trimmed
- Validation and normalization:
  - Uppercase normalization and regex validation
- Error handling:
  - Validation failures return `{"error": str(e)}`
  - Explicit `404` maps to `{"error": "Charity not found"}`
  - Other request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps selected fields: `charity_number`, `charity_name`, `registration_status`, `charity_type`, `registration_date`, `removal_date`, `activities`, `governance`, `financial`, `contact`, `trustees`
  - Adds `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://register-of-charities.charitycommission.gov.uk/api>

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
  const result = await client.callTool('get_charity', { charity_number: '123456' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

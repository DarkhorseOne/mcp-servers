# get_bank_holidays

## Purpose
Return upcoming UK bank holidays, either for all divisions or one division.

## Technical implementation details
- Tool name: `get_bank_holidays`
- Source: `gov_uk_mcp/tools/bank_holidays.py`
- Upstream API:
  - Base URL: `https://www.gov.uk`
  - Endpoint: `/bank-holidays.json`
  - Method: `GET`
  - Query params: none
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - `country` is optional
  - If provided, it is normalized with `lower()` and spaces replaced by `-`
  - The normalized key must exist in returned JSON keys, otherwise returns `{"error": "Invalid country..."}`
- Validation and normalization:
  - No `InputValidator` call is used
  - Upcoming events are filtered where event `date >= today`
- Error handling:
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - With `country`: `country`, `upcoming_holidays`, `data_source`, `retrieved_at`
  - Without `country`: one object per country key with `division` and `upcoming_holidays`, plus top-level `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://www.gov.uk>
- Endpoint used by implementation: <https://www.gov.uk/bank-holidays.json>

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
  const result = await client.callTool('get_bank_holidays', {
    country: 'england-and-wales'
  })

  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

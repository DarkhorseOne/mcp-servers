# search_charities

## Purpose
Search Charity Commission register entries by charity name.

## Technical implementation details
- Tool name: `search_charities`
- Source: `gov_uk_mcp/tools/charity.py`
- Upstream API:
  - Base URL: `https://register-of-charities.charitycommission.gov.uk/api`
  - Endpoint: `/search-charities`
  - Method: `GET`
  - Query params: `q` (name), `take=20`
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - `name` validated by `_validate_search_query`
  - Must be present, trimmed length 2..200
- Validation and normalization:
  - Trims whitespace only, no case normalization
- Error handling:
  - Validation failures return `{"error": str(e)}`
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - If none found: `{"message": "No charities found"}`
  - Otherwise maps `charities[]` to `charity_number`, `charity_name`, `registration_status`, `charity_type`, `registration_date`, `activities`
  - Returns `total_results`, `showing`, `charities`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://register-of-charities.charitycommission.gov.uk/api>
- Endpoint used by implementation: <https://register-of-charities.charitycommission.gov.uk/api/search-charities>

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
  const result = await client.callTool('search_charities', { name: 'Cancer Research' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

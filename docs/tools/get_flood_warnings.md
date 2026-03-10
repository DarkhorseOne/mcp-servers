# get_flood_warnings

## Purpose
Return active flood warnings in England, optionally filtered by postcode-like text or area text.

## Technical implementation details
- Tool name: `get_flood_warnings`
- Source: `gov_uk_mcp/tools/flood_warnings.py`
- Upstream API:
  - Base URL: `https://environment.data.gov.uk/flood-monitoring`
  - Endpoint: `/id/floods`
  - Method: `GET`
  - Query params: none
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - Optional `postcode` and `area`
  - If either is provided, code computes `search_term = (postcode or area).upper().replace(" ", "")`
  - Filter checks if `search_term` is contained in each warning `description` or `eaAreaName`
- Validation and normalization:
  - No `InputValidator` usage in this tool
- Error handling:
  - Empty upstream items returns `{"message": "No active flood warnings in England"}`
  - Empty post-filter results returns `{"message": "No flood warnings for ..."}`
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps each item to `severity`, `severity_description`, `area`, `description`, `message`, `time_raised`, `time_severity_changed`
  - Adds `total_warnings`, `warnings`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://environment.data.gov.uk/flood-monitoring>
- Endpoint used by implementation: <https://environment.data.gov.uk/flood-monitoring/id/floods>

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
  const result = await client.callTool('get_flood_warnings', { area: 'Yorkshire' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

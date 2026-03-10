# get_road_status

## Purpose
Get status for one or more TfL roads.

## Technical implementation details
- Tool name: `get_road_status`
- Source: `gov_uk_mcp/tools/transport.py`
- Upstream API:
  - Base URL: `https://api.tfl.gov.uk`
  - Endpoint: `/Road/{road_ids}`
  - Method: `GET`
  - Query params: optional `app_key` from `TFL_API_KEY`
  - Headers: none
  - Timeout: `10` seconds
  - Auth: API key via query param is optional in code
- Input handling:
  - `road_ids` must be a non-empty string
  - Code splits by comma, trims and uppercases each ID
  - Each ID must be non-empty and length <= 10
- Validation and normalization:
  - Custom validation in function, no `InputValidator` usage
- Error handling:
  - Invalid input format returns explicit errors
  - Upstream `404` returns `{"error": "Road not found"}`
  - Other request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps each returned road to `id`, `display_name`, `status`, `status_description`, `url`
  - Adds `roads`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://api.tfl.gov.uk>
- API portal: <https://api-portal.tfl.gov.uk/>

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
  const result = await client.callTool('get_road_status', { road_ids: 'A2,A40,M25' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

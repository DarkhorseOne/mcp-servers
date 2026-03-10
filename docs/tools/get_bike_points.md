# get_bike_points

## Purpose
Get TfL Santander Cycles bike point availability, optionally near coordinates.

## Technical implementation details
- Tool name: `get_bike_points`
- Source: `gov_uk_mcp/tools/transport.py`
- Upstream API:
  - Base URL: `https://api.tfl.gov.uk`
  - Endpoint: `/BikePoint`
  - Method: `GET`
  - Query params:
    - optional `app_key` from `TFL_API_KEY`
    - if both `lat` and `lon` are provided, also `lat`, `lon`, `radius`
  - Headers: none
  - Timeout: `10` seconds
  - Auth: API key via query param is optional in code
- Input handling:
  - `lat` and `lon` are optional and only used when both exist
  - No coordinate validation in this function
- Validation and normalization:
  - None
- Error handling:
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Handles both response formats:
    - dict with `places`
    - top-level list
  - Maps first 20 points to `id`, `name`, `lat`, `lon`, `bikes_available`, `empty_docks`, `total_docks`
  - Dock counts are parsed from `additionalProperties` keys `NbBikes`, `NbEmptyDocks`, `NbDocks`
  - Adds `total_results`, `showing`, `bike_points`, `data_source`, `retrieved_at`

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
  const result = await client.callTool('get_bike_points', {
    lat: 51.5074,
    lon: -0.1278,
    radius: 500
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

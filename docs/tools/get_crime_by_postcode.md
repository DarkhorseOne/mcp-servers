# get_crime_by_postcode

## Purpose
Get street-level crime categories near a postcode.

## Technical implementation details
- Tool name: `get_crime_by_postcode`
- Source: `gov_uk_mcp/tools/police_crime.py`
- Upstream APIs:
  1. Postcode geocoding
     - URL: `https://api.postcodes.io/postcodes/{postcode}`
     - Method: `GET`
     - Timeout: `10` seconds
  2. Police data
     - Base URL: `https://data.police.uk/api`
     - Endpoint: `/crimes-street/all-crime`
     - Method: `GET`
     - Query params: `lat`, `lng`, optional `date` in helper (not exposed by this tool)
     - Timeout: `10` seconds
  - Headers: none
  - Auth: none
- Input handling:
  - Postcode validated by `InputValidator.validate_uk_postcode`
  - Coordinates fetched via postcodes.io then passed to internal crime fetch
- Validation and normalization:
  - Coordinates validated by `InputValidator.validate_coordinates` inside helper
- Error handling:
  - Validation errors return `{"error": str(e)}`
  - Postcode `404` returns `{"error": "Postcode not found"}`
  - Non-200 postcode status returns `{"error": "Invalid postcode"}`
  - No crime rows returns message
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps up to 50 crimes to `category`, `location_type`, `street`, `month`, `outcome_status`
  - Adds `total_crimes`, `showing`, `crimes`, `data_source`, `retrieved_at`

## Official documentation links
- Police API base used by implementation: <https://data.police.uk/api>
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
  const result = await client.callTool('get_crime_by_postcode', { postcode: 'SW1A 1AA' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

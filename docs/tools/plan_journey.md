# plan_journey

## Purpose
Plan TfL journeys between two London locations.

## Technical implementation details
- Tool name: `plan_journey`
- Source: `gov_uk_mcp/tools/transport.py`
- Upstream API:
  - Base URL: `https://api.tfl.gov.uk`
  - Endpoint: `/Journey/JourneyResults/{from_location}/to/{to_location}`
  - Method: `GET`
  - Query params:
    - optional `app_key` from `TFL_API_KEY`
    - optional `via`
    - optional `time`
    - optional `timeIs` set to `Arriving` or `Departing`
  - Headers: none
  - Timeout: `15` seconds
  - Auth: API key via query param is optional in code
- Input handling:
  - `from_location`, `to_location`, optional `via` validated with `_validate_location`
  - Validation checks present, trimmed length 2..200, rejects `< > " '` characters
- Validation and normalization:
  - Inputs are trimmed, otherwise preserved
- Error handling:
  - Validation failures return `{"error": str(e)}`
  - Upstream `300` returns ambiguity error
  - Upstream `404` returns location not found
  - Other request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps up to 5 journeys
  - Each journey includes `duration`, `start_time`, `arrival_time`, and mapped `legs`
  - Leg fields: `mode`, `duration`, `departure_point`, `arrival_point`, `departure_time`, `arrival_time`, `instruction`
  - Adds `from`, `to`, `journey_options`, `data_source`, `retrieved_at`

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
  const result = await client.callTool('plan_journey', {
    from_location: 'Brixton',
    to_location: 'St Pancras'
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

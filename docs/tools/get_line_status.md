# get_line_status

## Purpose
Get status for one TfL line by line ID.

## Technical implementation details
- Tool name: `get_line_status`
- Source: `gov_uk_mcp/tools/transport.py`
- Upstream API:
  - Base URL: `https://api.tfl.gov.uk`
  - Endpoint: `/Line/{line_id}/Status`
  - Method: `GET`
  - Query params: optional `app_key` when `TFL_API_KEY` exists
  - Headers: none
  - Timeout: `10` seconds
  - Auth: API key via query param is optional in code
- Input handling:
  - `line_id` validated by `InputValidator.validate_tfl_line_id`
  - Validator lowercases and trims, checks regex and membership in built-in known line list
- Validation and normalization:
  - Normalized lowercase `line_id`
- Error handling:
  - Validation failures return `{"error": str(e)}`
  - Explicit upstream `404` and empty result both map to `{"error": "Line not found"}`
  - Other request errors use `sanitize_api_error(e)`
- Response mapping:
  - Uses first element of response array and first line status
  - Returns `line`, `status`, `reason`, `disruption`, `data_source`, `retrieved_at`

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
  const result = await client.callTool('get_line_status', { line_id: 'central' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

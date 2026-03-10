# get_tube_status

## Purpose
Get current status for all London Underground lines.

## Technical implementation details
- Tool name: `get_tube_status`
- Source: `gov_uk_mcp/tools/transport.py`
- Upstream API:
  - Base URL: `https://api.tfl.gov.uk`
  - Endpoint: `/Line/Mode/tube/Status`
  - Method: `GET`
  - Query params: optional `app_key` when `TFL_API_KEY` exists
  - Headers: none
  - Timeout: `10` seconds
  - Auth: API key via query param is optional in code
- Input handling:
  - No function parameters
- Validation and normalization:
  - None
- Error handling:
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - For each line, maps first `lineStatuses` entry to `status`, `reason`, `disruption`
  - Returns `lines`, `data_source`, `retrieved_at`

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
  const result = await client.callTool('get_tube_status', {})
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

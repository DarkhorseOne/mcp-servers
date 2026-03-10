# find_mp

## Purpose
Find a current MP by name-like query, constituency-like query, or postcode.

## Technical implementation details
- Tool name: `find_mp`
- Source: `gov_uk_mcp/tools/mps.py`
- Upstream APIs:
  1. UK Parliament Members API
     - Base URL: `https://members-api.parliament.uk/api`
     - Endpoints used:
       - `/Members/Search`
       - `/Location/Constituency/Search`
     - Method: `GET`
     - Timeout: `10` seconds
     - Auth: none
  2. Postcodes.io API for postcode flow
     - Endpoint: `https://api.postcodes.io/postcodes/{postcode}`
     - Timeout: `10` seconds
     - Auth: none
  3. Optional thumbnail fetch
     - `requests.get(thumbnailUrl, timeout=5)`
- Input handling:
  - Postcode detection uses regex in `_looks_like_postcode`
  - If postcode-like:
    1. Resolve constituency via postcodes.io
    2. Resolve constituency ID via Members API constituency search
    3. Resolve current MP via Members search with `ConstituencyId` and `IsCurrentMember=True`
  - If not postcode-like:
    - Search Members API by `Name`, `IsCurrentMember=True`, `take=10`
- Validation and normalization:
  - Postcode path strips spaces and uppercases for detection and postcodes.io request
  - No `InputValidator` usage here
- Error handling:
  - Postcode/lookup branches include direct error strings like `{"error": "Could not find constituency..."}`
  - Name search request errors use `sanitize_api_error(e)`
  - Postcode branch also has custom `Request timed out` and `API request failed: ...`
- Response mapping:
  - Single match returns MP object with: `id`, `name`, `party`, `constituency`, `membership_start`, `gender`, `thumbnail_url`, `data_source`, `retrieved_at`
  - Multiple matches returns `total_results`, `mps`, `data_source`, `retrieved_at`
  - `thumbnail_url` is transformed to base64 data URL when image fetch succeeds

## Official documentation links
- Parliament Members API base used by implementation: <https://members-api.parliament.uk/api>
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
  const result = await client.callTool('find_mp', { query: 'SW1A 1AA' })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

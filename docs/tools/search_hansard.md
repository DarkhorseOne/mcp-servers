# search_hansard

## Purpose
Search modern Hansard debates (implementation targets 2015-present API).

## Technical implementation details
- Tool name: `search_hansard`
- Source: `gov_uk_mcp/tools/hansard.py`
- Upstream API:
  - Base URL: `https://hansard-api.parliament.uk`
  - Endpoint: `/search/debates.json`
  - Method: `GET`
  - Query params:
    - `searchTerm` from sanitized query
    - `skip=0`
    - `take=20`
    - optional `startDate`, `endDate`, `memberName`
  - Headers: none
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - `query` sanitized by `InputValidator.sanitize_query`
  - Optional `date_from` and `date_to` validated by `InputValidator.validate_date_format` (`YYYY-MM-DD` regex)
- Validation and normalization:
  - Query strips control chars and trims max length 200
  - Dates are format-checked only
- Error handling:
  - Validation failures return `{"error": str(e)}`
  - No result list returns `{"message": "No debates found matching your search"}`
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Supports both `Results` and `results` keys from upstream
  - Maps to `date`, `house`, `debate_section`, `title`, `speaker`, `excerpt`, `debate_id`, `url`
  - Adds `query`, `total_results`, `showing`, `debates`, `date_range`, `data_source`, `retrieved_at`
  - Adds `note` when `date_from` year is before 2015
- Implementation note:
  - Docstring says 2015-present, code also appends an informational note for pre-2015 `date_from`.

## Official documentation links
- API base used by implementation: <https://hansard-api.parliament.uk>
- Endpoint used by implementation: <https://hansard-api.parliament.uk/search/debates.json>

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
  const result = await client.callTool('search_hansard', {
    query: 'NHS workforce',
    date_from: '2024-01-01'
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

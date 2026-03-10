# search_food_establishments

## Purpose
Search Food Standards Agency establishment records and hygiene ratings.

## Technical implementation details
- Tool name: `search_food_establishments`
- Source: `gov_uk_mcp/tools/food_hygiene.py`
- Upstream API:
  - Base URL: `https://api.ratings.food.gov.uk`
  - Endpoint: `/Establishments`
  - Method: `GET`
  - Query params:
    - optional `name`
    - optional `address` from `postcode.strip()`
    - optional `localAuthorityId`
  - Headers:
    - `x-api-version: 2`
    - `Accept: application/json`
  - Timeout: `10` seconds
  - Auth: none
- Input handling:
  - Requires at least one of `name`, `postcode`, `local_authority`
- Validation and normalization:
  - No `InputValidator` usage
  - Postcode is only `.strip()` because code comment notes spaces improve matching
- Error handling:
  - Missing inputs returns explicit error
  - No results returns message with `search_params`
  - Request errors use `sanitize_api_error(e)`
- Response mapping:
  - Maps first 20 `establishments` entries to selected business, address, authority, rating, score fields
  - Adds `total_results`, `showing`, `establishments`, `data_source`, `retrieved_at`

## Official documentation links
- API base used by implementation: <https://api.ratings.food.gov.uk>

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
  const result = await client.callTool('search_food_establishments', {
    postcode: 'SW1A 1AA'
  })
  if (isToolError(result)) throw new Error(result.error)
  return result
}
```

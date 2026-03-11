# @darkhorseone/mcp-server-uk-parliament-lordsvotes

MCP server package for the UK Parliament Lords Votes API.

- Source API (official): https://lordsvotes-api.parliament.uk/

This package provides:
- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-lordsvotes`
- Version: `0.1.0`
- Runtime: Node.js (ESM)

## Environment variables

- `UPSTREAM_BASE_URL` (default: `https://lordsvotes-api.parliament.uk`)
- `UPSTREAM_TIMEOUT_MS` (default: `10000`)
- `USER_AGENT` (default: `@darkhorseone/mcp-server-uk-parliament-lordsvotes/0.1.0`)
- `UKPLV_HTTP_PORT` (HTTP mode only, default: `8787`)

## Tools

1. `get_division_by_id`
   - endpoint: `GET /data/Divisions/{divisionId}`
   - required input: `divisionId: number`
2. `search_divisions_total_results`
   - endpoint: `GET /data/Divisions/searchTotalResults`
3. `search_divisions`
   - endpoint: `GET /data/Divisions/search`
   - paging defaults: `skip=0`, `take=25`
4. `get_member_voting_records`
   - endpoint: `GET /data/Divisions/membervoting`
   - required input: `memberId >= 1`
   - paging defaults: `skip=0`, `take=25`
5. `get_divisions_grouped_by_party`
   - endpoint: `GET /data/Divisions/groupedbyparty`

Shared optional filters:
- `searchTerm`
- `memberId`
- `includeWhenMemberWasTeller`
- `startDate`
- `endDate`
- `divisionNumber`
- `totalVotesCastComparator` (`LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan`)
- `totalVotesCastValueToCompare`
- `majorityComparator` (`LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan`)
- `majorityValueToCompare`

## Error codes

- `INVALID_ARGUMENT` (e.g. invalid input / upstream 400)
- `NOT_FOUND` (upstream 404)
- `UNAVAILABLE` (upstream 503)
- `UPSTREAM_TIMEOUT` (timeout)
- `UPSTREAM_NETWORK_ERROR` (network failure)
- `UPSTREAM_ERROR` (other upstream failures)

## Build

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run build
```

## Run (stdio MCP server)

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run dev
```

## Run (HTTP proxy server)

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run start:http
```

Health check:

```bash
curl http://127.0.0.1:8787/healthz
```

## Quality checks

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run build
```

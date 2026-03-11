# @darkhorseone/mcp-server-uk-parliament-bills

MCP server package for the UK Parliament Bills API.

- Source API (official): https://bills-api.parliament.uk

This package provides:

- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-bills`
- Version: `1.0.0`
- Runtime: Node.js (ESM)

## What it exposes

Tools generated from Bills API endpoints (`GET` only):

1. `search_bill_stage_amendments`
2. `get_bill_stage_amendment`
3. `list_bill_news_articles`
4. `list_bill_types`
5. `search_bills`
6. `get_bill`
7. `get_bill_stage_details`
8. `list_bill_stages`
9. `get_publication_document`
10. `download_publication_document`
11. `search_bill_stage_ping_pong_items`
12. `get_bill_stage_ping_pong_item`
13. `list_publication_types`
14. `list_bill_publications`
15. `list_bill_stage_publications`
16. `get_rss_all_bills`
17. `get_rss_public_bills`
18. `get_rss_private_bills`
19. `get_rss_bill_by_id`
20. `search_sittings`
21. `list_stage_references`

## Environment variables

- `UPSTREAM_BASE_URL` (default: `https://bills-api.parliament.uk`)
- `REQUEST_TIMEOUT_MS` (default: `10000`)
- `UKP_HTTP_PORT` (HTTP mode only, default: `3000`)

## Install

From repository root:

```bash
pnpm install
```

## Build

From repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-bills mcp-server-uk-parliament-bills
```

## Run (HTTP proxy server)

Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-bills mcp-server-uk-parliament-bills-http
```

Health check:

```bash
curl http://127.0.0.1:3000/healthz
```

Proxy pattern:

```text
GET /proxy/<upstream-path>?<query>
```

Examples:

```bash
curl "http://127.0.0.1:3000/proxy/api/v1/Bills/1"
curl "http://127.0.0.1:3000/proxy/api/v1/Bills?SearchTerm=energy&SortOrder=TitleAscending"
curl "http://127.0.0.1:3000/proxy/api/v1/Rss/Bills/5.rss"
```

## Inspect with MCP Inspector

Local build:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run inspect:local
```

Published package:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run inspect:npm
```

## Quality checks

Run package-scoped checks from repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run build
```

## Compatibility note on response models

The source swagger includes extensive response schemas. This package does not force endpoint-specific response deserialization.

Compatibility strategy in this package:

- request/parameter mapping strictly follows `paths` definitions,
- enum constraints are enforced for filter parameters (Decision/House/SortOrder, etc.),
- upstream JSON payload is preserved in `data` as returned by API,
- RSS endpoints return raw text in `data`.

## Error envelope example

```json
{
  "status": 504,
  "error": {
    "code": "UPSTREAM_TIMEOUT",
    "message": "Upstream timeout",
    "details": {
      "code": "UPSTREAM_TIMEOUT",
      "timeoutMs": 10000
    }
  },
  "upstream_path": "/api/v1/Bills",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

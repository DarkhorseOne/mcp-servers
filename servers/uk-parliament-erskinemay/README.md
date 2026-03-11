# @darkhorseone/mcp-server-uk-parliament-erskinemay

MCP server package for the UK Parliament Erskine May API.

- Source API (official): https://erskinemay-api.parliament.uk

This package provides:

- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-erskinemay`
- Version: `1.0.0`
- Runtime: Node.js (ESM)

## What it exposes

Tools generated from Erskine May API endpoints (`GET` only):

1. `get_chapter_by_chapter_number`
2. `browse_index_terms`
3. `get_index_term_by_index_term_id`
4. `list_parts`
5. `get_part_by_part_number`
6. `search_index_term_results_by_search_term`
7. `get_paragraph_by_reference`
8. `search_paragraph_results_by_search_term`
9. `search_section_results_by_search_term`
10. `get_section_by_section_id`
11. `get_section_overview_by_section_id_and_step`

## Environment variables

- `UPSTREAM_BASE_URL` (default: `https://erskinemay-api.parliament.uk`)
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
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-erskinemay mcp-server-uk-parliament-erskinemay
```

## Run (HTTP proxy server)

Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-erskinemay mcp-server-uk-parliament-erskinemay-http
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
curl "http://127.0.0.1:3000/proxy/api/Part"
curl "http://127.0.0.1:3000/proxy/api/Section/12,1"
curl "http://127.0.0.1:3000/proxy/api/IndexTerm/browse?startLetter=A&take=10"
```

## Inspect with MCP Inspector

Local build:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run inspect:local
```

Published package:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run inspect:npm
```

## Quality checks

Run package-scoped checks from repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run build
```

## Compatibility note on response models

The source swagger has detailed nested response schemas. This package does not force endpoint-specific response deserialization.

Compatibility strategy in this package:

- request/parameter mapping strictly follows `paths` definitions,
- input validation and required checks are applied before upstream calls,
- upstream JSON payload is preserved in `data` as returned by API.

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
  "upstream_path": "/api/Part",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

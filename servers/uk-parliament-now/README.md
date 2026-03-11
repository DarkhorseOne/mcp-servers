# @darkhorseone/mcp-server-uk-parliament-now

MCP server package for the UK Parliament NOW Annunciator Content API.

- Source API (official): https://now-api.parliament.uk

This package provides:

- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-now`
- Version: `1.0.0`
- Runtime: Node.js (ESM)

## What it exposes

Tools generated from NOW API endpoints (`GET` only):

1. `get_current_message_by_annunciator`
2. `get_latest_message_by_annunciator_and_date`

## Environment variables

- `UPSTREAM_BASE_URL` (default: `https://now-api.parliament.uk`)
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
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-now mcp-server-uk-parliament-now
```

## Run (HTTP proxy server)

Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-now mcp-server-uk-parliament-now-http
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
curl "http://127.0.0.1:3000/proxy/api/Message/message/CommonsMain/current"
curl "http://127.0.0.1:3000/proxy/api/Message/message/LordsMain/2025-01-01T00:00:00Z"
```

## Inspect with MCP Inspector

Local build:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run inspect:local
```

Published package:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run inspect:npm
```

## Quality checks

Run package-scoped checks from repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run build
```

## Compatibility note on response models

The source swagger has nested object/enum response models. This package does not force endpoint-specific response deserialization.

Compatibility strategy in this package:

- request/parameter mapping strictly follows `paths` definitions,
- enum constraints are enforced for `annunciator` (`CommonsMain`, `LordsMain`),
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
  "upstream_path": "/api/Message/message/CommonsMain/current",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

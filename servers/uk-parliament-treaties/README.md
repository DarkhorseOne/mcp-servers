# @darkhorseone/mcp-server-uk-parliament-treaties

MCP server package for the UK Parliament Treaties API.

- Source API (official): https://treaties-api.parliament.uk

This package provides:

- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-treaties`
- Version: `1.0.0`
- Runtime: Node.js (ESM)

## What it exposes

Tools generated from Treaties API endpoints (`GET` only):

1. `get_business_item_by_id`
2. `list_government_organisations`
3. `list_series_memberships`
4. `list_treaties`
5. `get_treaty_by_id`
6. `list_business_items_by_treaty_id`

## Environment variables

- `UPSTREAM_BASE_URL` (default: `https://treaties-api.parliament.uk`)
- `REQUEST_TIMEOUT_MS` (default: `10000`)
- `UKP_HTTP_PORT` (HTTP mode only, default: `8787`)

## Install

From repository root:

```bash
pnpm install
```

## Build

From repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-treaties mcp-server-uk-parliament-treaties
```

## Run (HTTP proxy server)

Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-treaties mcp-server-uk-parliament-treaties-http
```

Health check:

```bash
curl http://127.0.0.1:8787/healthz
```

Proxy pattern:

```text
GET /proxy/<upstream-path>?<query>
```

Examples:

```bash
curl "http://127.0.0.1:8787/proxy/api/Treaty/CP123"
curl "http://127.0.0.1:8787/proxy/api/Treaty?House=Commons&Take=10"
```

## Inspect with MCP Inspector

Local build:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run inspect:local
```

Published package:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run inspect:npm
```

## Quality checks

Run package-scoped checks from repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run build
```

## Compatibility note on response models

The source swagger uses Resource/Collection wrapper schemas. This package does not force endpoint-specific response deserialization from those wrappers.

Compatibility strategy in this package:

- request/parameter mapping strictly follows `paths` definitions,
- enum constraints are applied from both direct enums and enum `$ref` resolutions,
- upstream JSON payload is preserved in `data` as returned by API.

This ensures stable behavior even with nested response schema wrappers.

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

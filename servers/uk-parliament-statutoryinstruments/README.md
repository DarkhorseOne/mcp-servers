# @darkhorseone/mcp-server-uk-parliament-statutoryinstruments

MCP server package for the UK Parliament Statutory Instruments API.

- Source API (official): https://statutoryinstruments-api.parliament.uk

This package provides:

- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-statutoryinstruments`
- Version: `1.0.0`
- Runtime: Node.js (ESM)

## What it exposes

Tools generated from Statutory Instruments API endpoints (`GET` only):

- Total tools: **16** (v1 + v2 endpoints)

## Environment variables

- `UPSTREAM_BASE_URL` (default: `https://statutoryinstruments-api.parliament.uk`)
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
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-statutoryinstruments mcp-server-uk-parliament-statutoryinstruments
```

## Run (HTTP proxy server)

Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-statutoryinstruments mcp-server-uk-parliament-statutoryinstruments-http
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
curl "http://127.0.0.1:8787/proxy/api/v1/Procedure/abcd1234"
curl "http://127.0.0.1:8787/proxy/api/v2/StatutoryInstrument?House=Commons&Take=10"
```

## Inspect with MCP Inspector

Local build:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run inspect:local
```

Published package:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run inspect:npm
```

## Quality checks

Run package-scoped checks from repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run build
```

## Compatibility note on response models

The source swagger includes many complex generic response `$ref` schema names. This package does not force endpoint-specific deserialization from those references.

Compatibility strategy in this package:

- request/parameter mapping strictly follows `paths` definitions,
- enum constraints are applied from both direct enums and enum `$ref` resolutions,
- upstream JSON payload is preserved in `data` as returned by API.

This ensures stable behavior even with complex upstream schema metadata.

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

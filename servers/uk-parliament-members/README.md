# @darkhorseone/mcp-server-uk-parliament-members

MCP server package for the UK Parliament Members API.

This package provides:
- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-members`
- Version: `0.1.0`
- Runtime: Node.js (ESM)

## What it exposes

- MCP tools generated from UK Parliament Members API endpoints (`GET` only).
- Typed parameter handling for:
  - `string`
  - `number`
  - `boolean`
  - `array:string`
  - `array:number`

## Environment variables

- `UKP_API_BASE_URL` (default: `https://members-api.parliament.uk`)
- `UKP_REQUEST_TIMEOUT_MS` (default: `10000`)
- `UKP_HTTP_PORT` (HTTP mode only, default: `8787`)

## Install

From repository root:

```bash
pnpm install
```

## Build

From repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members exec node dist/index.js
```

## Run (HTTP proxy server)

Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run start:http
```

Health check:

```bash
curl http://127.0.0.1:8787/healthz
```

Proxy pattern:

```text
GET /proxy/<upstream-path>?<query>
```

Example:

```bash
curl "http://127.0.0.1:8787/proxy/api/Members/History?ids=1&ids=2"
```

## Inspect with MCP Inspector

Local build:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run inspect:local
```

Published package:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run inspect:npm
```

## Quality checks

Run package-scoped checks from repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run build
```

## Notes

- Tool registrations are generated from endpoint metadata in `src/endpoints.generated.ts`.
- MCP tool `inputSchema` is constructed in `src/tools.generated.ts`.
- Endpoint parameter metadata supports optional `description` and `enum` fields for tool schema surfacing.

# @darkhorseone/mcp-server-uk-parliament-committees

MCP server package for the UK Parliament Committees API.

- Source API (official): https://committees-api.parliament.uk/index.html

This package provides:
- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-committees`
- Version: `1.0.0`
- Runtime: Node.js (ESM)

## Environment variables

- `UKPCOM_API_BASE_URL` (default: `https://committees-api.parliament.uk`)
- `UKPCOM_REQUEST_TIMEOUT_MS` (default: `10000`)
- `UKPCOM_HTTP_PORT` (HTTP mode only, default: `8787`)

## Install

From repository root:

```bash
pnpm install
```

## Build

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-committees mcp-server-uk-parliament-committees
```

## AI Agent MCP configuration

> In client `mcpServers` config (Claude/Cursor/VS Code), `transportType` is usually not required.
> For MCP Inspector payloads, set `transportType: "stdio"` explicitly.

### Generic `mcpServers` JSON config

```json
{
  "mcpServers": {
    "uk-parliament-committees": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-committees", "mcp-server-uk-parliament-committees"],
      "env": {
        "UKPCOM_API_BASE_URL": "https://committees-api.parliament.uk",
        "UKPCOM_REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

### MCP Inspector (explicit stdio)

```json
{
  "command": "npx",
  "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-committees", "mcp-server-uk-parliament-committees"],
  "transportType": "stdio"
}
```

## Run (HTTP proxy server)

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-committees mcp-server-uk-parliament-committees-http
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
curl "http://127.0.0.1:8787/proxy/api/Committees?Take=5"
```

## Inspect with MCP Inspector

Local build:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run inspect:local
```

Published package:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run inspect:npm
```

## Quality checks

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run build
```

## Notes

- Tool registrations are generated from endpoint metadata in `src/endpoints.generated.ts`.
- MCP tool `inputSchema` is constructed in `src/tools.generated.ts`.
- Endpoint parameter metadata supports optional `description` and `enum` fields for tool schema surfacing.

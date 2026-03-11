# @darkhorseone/mcp-server-uk-parliament-commonsvotes

MCP server package for the UK Parliament Commons Votes API.

- Source API (official): https://commonsvotes-api.parliament.uk/
- Swagger UI: https://commonsvotes-api.parliament.uk/swagger/ui/index

This package provides:
- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-commonsvotes`
- Version: `0.1.0`
- Runtime: Node.js (ESM)

## Environment variables

- `UKPCV_API_BASE_URL` (default: `https://commonsvotes-api.parliament.uk`)
- `UKPCV_REQUEST_TIMEOUT_MS` (default: `10000`)
- `UKPCV_HTTP_PORT` (HTTP mode only, default: `8787`)

## Install

From repository root:

```bash
pnpm install
```

## Build

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-commonsvotes mcp-server-uk-parliament-commonsvotes
```

## AI Agent MCP configuration

> In client `mcpServers` config (Claude/Cursor/VS Code), `transportType` is usually not required.
> For MCP Inspector payloads, set `transportType: "stdio"` explicitly.

### Generic `mcpServers` JSON config

```json
{
  "mcpServers": {
    "uk-parliament-commonsvotes": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-commonsvotes", "mcp-server-uk-parliament-commonsvotes"],
      "env": {
        "UKPCV_API_BASE_URL": "https://commonsvotes-api.parliament.uk",
        "UKPCV_REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

### MCP Inspector (explicit stdio)

```json
{
  "command": "npx",
  "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-commonsvotes", "mcp-server-uk-parliament-commonsvotes"],
  "transportType": "stdio"
}
```

## Run (HTTP proxy server)

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-commonsvotes mcp-server-uk-parliament-commonsvotes-http
```

Health check:

```bash
curl http://127.0.0.1:8787/healthz
```

## Quality checks

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run build
```

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

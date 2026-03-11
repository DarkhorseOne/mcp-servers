# @darkhorseone/mcp-server-uk-parliament-interests

MCP server package for the UK Parliament Register of Interests API.

- Source API (official): https://interests-api.parliament.uk/

This package provides:
- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-interests`
- Version: `0.1.0`
- Runtime: Node.js (ESM)

## Environment variables

- `UKPI_API_BASE_URL` (**required**, e.g. `https://interests-api.parliament.uk`)
- `UKPI_REQUEST_TIMEOUT_MS` (default: `10000`)
- `UKPI_HTTP_PORT` (HTTP mode only, default: `8787`)

## Install

From repository root:

```bash
pnpm install
```

## Build

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-interests mcp-server-uk-parliament-interests
```

## AI Agent MCP configuration

> In client `mcpServers` config (Claude/Cursor/VS Code), `transportType` is usually not required.
> For MCP Inspector payloads, set `transportType: "stdio"` explicitly.

### Generic `mcpServers` JSON config

```json
{
  "mcpServers": {
    "uk-parliament-interests": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-interests", "mcp-server-uk-parliament-interests"],
      "env": {
        "UKPI_API_BASE_URL": "https://interests-api.parliament.uk",
        "UKPI_REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

### MCP Inspector (explicit stdio)

```json
{
  "command": "npx",
  "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-interests", "mcp-server-uk-parliament-interests"],
  "transportType": "stdio"
}
```

## Run (HTTP proxy server)

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-interests mcp-server-uk-parliament-interests-http
```

Health check:

```bash
curl http://127.0.0.1:8787/healthz
```

## Quality checks

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run build
```

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

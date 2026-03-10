# @darkhorseone/mcp-server-uk-parliament-members

MCP server package for the UK Parliament Members API.

- Source API (official): https://members-api.parliament.uk/index.html

This package provides:
- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-members`
- Version: `1.0.0`
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

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-members mcp-server-uk-parliament-members
```

## AI Agent MCP configuration

Use this package as a stdio MCP server in AI agents that support `mcpServers` configuration.

> Note: In `mcpServers` client config (Claude/Cursor/VS Code), `transportType` is typically not required.
> For MCP Inspector connection payloads, set `transportType` explicitly to `"stdio"`.

Official MCP/client docs:
- Model Context Protocol (local server connection): https://modelcontextprotocol.io/docs/develop/connect-local-servers
- Cursor MCP docs: https://cursor.com/docs/mcp
- VS Code MCP servers docs: https://code.visualstudio.com/docs/copilot/customization/mcp-servers

### Generic command (published package)

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-members mcp-server-uk-parliament-members
```

### Generic `mcpServers` JSON config

```json
{
  "mcpServers": {
    "uk-parliament-members": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-members", "mcp-server-uk-parliament-members"],
      "env": {
        "UKP_API_BASE_URL": "https://members-api.parliament.uk",
        "UKP_REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

### Claude Desktop

`claude_desktop_config.json` example:

```json
{
  "mcpServers": {
    "uk-parliament-members": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-members", "mcp-server-uk-parliament-members"],
      "env": {
        "UKP_API_BASE_URL": "https://members-api.parliament.uk",
        "UKP_REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

### Cursor

Add a new MCP stdio server in Cursor using:

- command: `npx`
- args: `-y -p @darkhorseone/mcp-server-uk-parliament-members mcp-server-uk-parliament-members`

You can also run directly to verify command behavior:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-members mcp-server-uk-parliament-members
```

### VS Code

Example `.vscode/mcp.json`:

```json
{
  "servers": {
    "uk-parliament-members": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-members", "mcp-server-uk-parliament-members"],
      "env": {
        "UKP_API_BASE_URL": "https://members-api.parliament.uk",
        "UKP_REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

### MCP Inspector (explicit stdio)

```json
{
  "command": "npx",
  "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-members", "mcp-server-uk-parliament-members"],
  "transportType": "stdio"
}
```

## Run (HTTP proxy server)

Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-members mcp-server-uk-parliament-members-http
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

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

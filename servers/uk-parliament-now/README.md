![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament NOW Annunciator MCP Server

# Summary
This MCP server provides structured access to UK Parliament NOW Annunciator data using the Model Context Protocol.
It enables AI agents to retrieve current and historical annunciator messages through API-backed tools and data access.
Developers can integrate the MCP server via stdio transport to query message feeds for Commons and Lords.
The server exposes tools that map directly to the NOW Annunciator API for automation and AI agents workflows.

## Features
- Retrieve the current annunciator message for Commons or Lords.
- Fetch the latest message after a specific date and time.
- Enforce annunciator enum constraints for reliable queries.
- Preserve upstream payloads in a standardized envelope for downstream tools.

## Available Tools
### get_current_message_by_annunciator
Return the current message by annunciator type.

Parameters:
- annunciator (string, path) – CommonsMain | LordsMain.

### get_latest_message_by_annunciator_and_date
Return the most recent message by annunciator after date time specified.

Parameters:
- annunciator (string, path) – CommonsMain | LordsMain.
- date (string, path) – ISO date-time string.

## Example Output
```json
{
  "status": 200,
  "data": {
    "annunciator": "CommonsMain",
    "message": "The House is sitting",
    "timestamp": "2026-03-11T09:00:00Z"
  },
  "upstream_path": "/api/Message/message/CommonsMain/current",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-now mcp-server-uk-parliament-now
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-now": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-now", "mcp-server-uk-parliament-now"],
      "env": {
        "UPSTREAM_BASE_URL": "https://now-api.parliament.uk",
        "REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Example Usage
- Retrieve the current Commons annunciator message.
- Fetch the latest Lords message after a given timestamp.
- Monitor annunciator updates for session status changes.

## Use Cases
- AI agents reporting live parliamentary status updates.
- Monitoring dashboards showing Commons/Lords session messages.
- Civic tech tools tracking sittings and announcements.
- Automation workflows that trigger on annunciator updates.

## Data Source
UK Parliament NOW Annunciator Content API
https://now-api.parliament.uk

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-now mcp-server-uk-parliament-now
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run start:http
```

Set a custom HTTP port with the `UKP_HTTP_PORT` environment variable (default: `3000`):

```bash
UKP_HTTP_PORT=3000 pnpm --filter @darkhorseone/mcp-server-uk-parliament-now run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-now -- mcp-server-uk-parliament-now-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-now -- node ./dist/http.js
```

Health check:

```bash
curl http://127.0.0.1:3000/healthz
```

Proxy pattern:

```text
GET /proxy/<upstream-path>?<query>
```

Example:

```bash
curl "http://127.0.0.1:3000/proxy/api/Message/message/CommonsMain/current"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: get_current_message_by_annunciator, get_latest_message_by_annunciator_and_date

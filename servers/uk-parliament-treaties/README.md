![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Treaties MCP Server

# Summary
This MCP server provides structured access to UK Parliament Treaties data using the Model Context Protocol.
It enables AI agents to retrieve treaties, business items, and government organisations through API-backed tools and data access.
Developers can integrate the MCP server via stdio transport to query treaty metadata, series memberships, and parliamentary process status.
The server exposes tools that map directly to the Treaties API for reliable automation and AI agents workflows.

## Features
- Search treaties with filters for house, series, and parliamentary process status.
- Retrieve treaty and business item details by ID.
- Access government organisations and series memberships.
- Preserve upstream payloads in a standardized envelope for downstream tools.

## Available Tools
### get_business_item_by_id
Returns business item by ID.

Parameters:
- id (string, path)

### list_government_organisations
Returns all government organisations.

### list_series_memberships
Returns all series memberships.

### list_treaties
Returns a list of treaties.

Parameters:
- SearchText (string, query)
- GovernmentOrganisationId (number, query)
- Series (string, query) – CountrySeriesMembership | EuropeanUnionSeriesMembership | MiscellaneousSeriesMembership
- ParliamentaryProcess (string, query) – NotConcluded | Concluded
- DebateScheduled (boolean, query)
- MotionsTabledAboutATreaty (boolean, query)
- CommitteeRaisedConcerns (boolean, query)
- House (string, query) – Commons | Lords
- Skip (number, query)
- Take (number, query)

### get_treaty_by_id
Returns a treaty by ID.

Parameters:
- id (string, path)

### list_business_items_by_treaty_id
Returns business items belonging to the treaty with ID.

Parameters:
- id (string, path)

## Example Output
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "treatyId": "CP123",
        "title": "Example Treaty",
        "house": "Commons"
      }
    ],
    "totalResults": 1
  },
  "upstream_path": "/api/Treaty",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-treaties mcp-server-uk-parliament-treaties
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-treaties": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-treaties", "mcp-server-uk-parliament-treaties"],
      "env": {
        "UPSTREAM_BASE_URL": "https://treaties-api.parliament.uk",
        "REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Example Usage
- Search treaties by house and parliamentary process status.
- Fetch a treaty by ID and review its metadata.
- Retrieve business items linked to a treaty.
- List government organisations associated with treaties.

## Use Cases
- AI agents summarizing treaty status and parliamentary scrutiny.
- Research tools tracking treaty processes and schedules.
- Civic tech platforms monitoring treaties by government body.
- Automation workflows exporting treaty metadata for analysis.

## Data Source
UK Parliament Treaties API
https://treaties-api.parliament.uk

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-treaties mcp-server-uk-parliament-treaties
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run start:http
```

Set a custom HTTP port with the `UKP_HTTP_PORT` environment variable (default: `8787`):

```bash
UKP_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-treaties run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-treaties -- mcp-server-uk-parliament-treaties-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-treaties -- node ./dist/http.js
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
curl "http://127.0.0.1:8787/proxy/api/Treaty?House=Commons&Take=10"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: get_business_item_by_id, list_government_organisations, list_series_memberships, list_treaties, get_treaty_by_id, list_business_items_by_treaty_id

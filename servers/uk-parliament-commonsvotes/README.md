![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Commons Votes MCP Server

# Summary
This MCP server provides structured access to UK Parliament Commons Votes data using the Model Context Protocol.
It enables AI agents to retrieve divisions and voting records through API-backed tools, delivering reliable data access for automation and analysis.
Developers can integrate the MCP server via stdio transport to access division details, member voting history, and search results.
The server exposes tools that map directly to the Commons Votes API for fast, consistent querying by AI agents and developer tools.

## Features
- Fetch Commons division details by division id in JSON or XML.
- Search divisions with filters for members, dates, and division numbers.
- Retrieve member voting records and grouped-by-party summaries.
- Preserve upstream responses in a consistent envelope for downstream tools and AI agents.

## Available Tools
### ukpcv_division_get_by_id
Return a Division.

Parameters:
- divisionId (number, path) – Division id.
- format (string, path) – xml or json.

### ukpcv_divisions_grouped_by_party
Return Divisions results grouped by party.

Parameters:
- format (string, path) – xml or json.
- queryParameters.searchTerm (string, query)
- queryParameters.memberId (number, query)
- queryParameters.includeWhenMemberWasTeller (boolean, query)
- queryParameters.startDate (string, query) – yyyy-MM-dd.
- queryParameters.endDate (string, query) – yyyy-MM-dd.
- queryParameters.divisionNumber (number, query)

### ukpcv_divisions_member_voting
Return voting records for a Member.

Parameters:
- format (string, path) – xml or json.
- queryParameters.memberId (number, query) – required.
- queryParameters.skip (number, query)
- queryParameters.take (number, query)
- queryParameters.searchTerm (string, query)
- queryParameters.includeWhenMemberWasTeller (boolean, query)
- queryParameters.startDate (string, query) – yyyy-MM-dd.
- queryParameters.endDate (string, query) – yyyy-MM-dd.
- queryParameters.divisionNumber (number, query)

### ukpcv_divisions_search
Return a list of Divisions.

Parameters:
- format (string, path) – json or xml.
- queryParameters.skip (number, query)
- queryParameters.take (number, query)
- queryParameters.searchTerm (string, query)
- queryParameters.memberId (number, query)
- queryParameters.includeWhenMemberWasTeller (boolean, query)
- queryParameters.startDate (string, query) – yyyy-MM-dd.
- queryParameters.endDate (string, query) – yyyy-MM-dd.
- queryParameters.divisionNumber (number, query)

### ukpcv_divisions_search_total_results
Return total results count.

Parameters:
- format (string, path) – json or xml.
- queryParameters.searchTerm (string, query)
- queryParameters.memberId (number, query)
- queryParameters.includeWhenMemberWasTeller (boolean, query)
- queryParameters.startDate (string, query) – yyyy-MM-dd.
- queryParameters.endDate (string, query) – yyyy-MM-dd.
- queryParameters.divisionNumber (number, query)

## Example Output
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "divisionId": 1234,
        "title": "Finance Bill - Third Reading",
        "divisionNumber": 15,
        "date": "2026-03-10"
      }
    ],
    "totalResults": 1
  },
  "upstream_path": "/data/divisions.json/search",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-commonsvotes mcp-server-uk-parliament-commonsvotes
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

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

## Example Usage
- Fetch a division by id in JSON format.
- Search divisions for a member within a date range.
- Retrieve a member's voting record and paging results.
- Get total results for a search query before fetching pages.

## Use Cases
- AI agents summarizing Commons divisions and outcomes.
- Political analysis tools tracking voting history by member.
- Civic technology platforms monitoring division trends.
- Automation workflows exporting division data for reporting.

## Data Source
UK Parliament Commons Votes API
https://commonsvotes-api.parliament.uk/

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-commonsvotes mcp-server-uk-parliament-commonsvotes
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run start:http
```

Set a custom HTTP port with the `UKPCV_HTTP_PORT` environment variable (default: `8787`):

```bash
UKPCV_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-commonsvotes -- mcp-server-uk-parliament-commonsvotes-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-commonsvotes -- node ./dist/http.js
```

Health check:

```bash
curl http://127.0.0.1:8787/healthz
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: ukpcv_division_get_by_id, ukpcv_divisions_grouped_by_party, ukpcv_divisions_member_voting, ukpcv_divisions_search, ukpcv_divisions_search_total_results

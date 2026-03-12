![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Lords Votes MCP Server

# Summary
This MCP server provides structured access to UK Parliament Lords Votes data using the Model Context Protocol.
It enables AI agents to retrieve divisions and voting records through API-backed tools for reliable data access and analysis.
Developers can integrate the MCP server via stdio transport to query divisions, member voting history, and grouped vote summaries.
The server exposes tools that map directly to the Lords Votes API for consistent automation and AI agents workflows.

## Features
- Fetch a Lords division by division id with standardized responses.
- Search divisions with filters for members, dates, and vote metrics.
- Retrieve member voting records with paging controls.
- Access divisions grouped by party for summary analysis.

## Available Tools
### get_division_by_id
Get a single Division which has the Id specified.

Parameters:
- divisionId (number, path) – Division id.

### search_divisions_total_results
Get total count of Divisions meeting the specified query.

Parameters:
- searchTerm (string, query)
- memberId (number, query)
- includeWhenMemberWasTeller (boolean, query)
- startDate (string, query)
- endDate (string, query)
- divisionNumber (number, query)
- totalVotesCastComparator (string, query) – LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan
- totalVotesCastValueToCompare (number, query)
- majorityComparator (string, query) – LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan
- majorityValueToCompare (number, query)

### search_divisions
Get a list of Divisions which meet the specified criteria.

Parameters:
- searchTerm (string, query)
- memberId (number, query)
- includeWhenMemberWasTeller (boolean, query)
- startDate (string, query)
- endDate (string, query)
- divisionNumber (number, query)
- totalVotesCastComparator (string, query) – LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan
- totalVotesCastValueToCompare (number, query)
- majorityComparator (string, query) – LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan
- majorityValueToCompare (number, query)
- skip (number, query) – Defaults to 0.
- take (number, query) – Defaults to 25.

### get_member_voting_records
Get a list of voting records for a Member.

Parameters:
- memberId (number, query) – Required.
- searchTerm (string, query)
- includeWhenMemberWasTeller (boolean, query)
- startDate (string, query)
- endDate (string, query)
- divisionNumber (number, query)
- totalVotesCastComparator (string, query) – LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan
- totalVotesCastValueToCompare (number, query)
- majorityComparator (string, query) – LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan
- majorityValueToCompare (number, query)
- skip (number, query) – Defaults to 0.
- take (number, query) – Defaults to 25.

### get_divisions_grouped_by_party
Get a list of Divisions which contain grouped by party.

Parameters:
- searchTerm (string, query)
- memberId (number, query)
- includeWhenMemberWasTeller (boolean, query)
- startDate (string, query)
- endDate (string, query)
- divisionNumber (number, query)
- totalVotesCastComparator (string, query) – LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan
- totalVotesCastValueToCompare (number, query)
- majorityComparator (string, query) – LessThan | LessThanOrEqualTo | EqualTo | GreaterThanOrEqualTo | GreaterThan
- majorityValueToCompare (number, query)

## Example Output
```json
{
  "ok": true,
  "endpoint": "/data/Divisions/search",
  "status": 200,
  "data": {
    "items": [
      {
        "divisionId": 456,
        "divisionNumber": 22,
        "title": "Education Bill - Second Reading",
        "date": "2026-03-10"
      }
    ],
    "totalResults": 1
  }
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-lordsvotes mcp-server-uk-parliament-lordsvotes
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-lordsvotes": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-lordsvotes", "mcp-server-uk-parliament-lordsvotes"],
      "env": {
        "UPSTREAM_BASE_URL": "https://lordsvotes-api.parliament.uk",
        "UPSTREAM_TIMEOUT_MS": "10000",
        "USER_AGENT": "@darkhorseone/mcp-server-uk-parliament-lordsvotes/1.0.0"
      }
    }
  }
}
```

## Example Usage
- Fetch a division by id and inspect vote details.
- Search divisions for a member in a date range.
- Retrieve total results for a query before paging.
- Get divisions grouped by party for summary analysis.

## Use Cases
- AI agents summarizing Lords divisions and voting outcomes.
- Parliamentary research tools tracking member voting history.
- Civic tech platforms monitoring vote trends and turnout.
- Automation pipelines exporting divisions for reporting.

## Data Source
UK Parliament Lords Votes API
https://lordsvotes-api.parliament.uk/

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-lordsvotes mcp-server-uk-parliament-lordsvotes
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run start:http
```

Set a custom HTTP port with the `UKPLV_HTTP_PORT` environment variable (default: `8787`):

```bash
UKPLV_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-lordsvotes -- mcp-server-uk-parliament-lordsvotes-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-lordsvotes -- node ./dist/http.js
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
curl "http://127.0.0.1:8787/proxy/data/Divisions/search?SearchTerm=education&take=5"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: get_division_by_id, search_divisions_total_results, search_divisions, get_member_voting_records, get_divisions_grouped_by_party

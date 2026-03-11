![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Bills MCP Server

# Summary
This MCP server provides structured access to UK Parliament Bills data using the Model Context Protocol.
It enables AI agents to query bills, stages, publications, amendments, and RSS feeds through reliable tools and an API-backed data source.
Developers can integrate the MCP server into local workflows or automation pipelines using stdio transport, while preserving upstream API responses.
The server exposes tools for search, lookup, and publication retrieval, optimized for AI agents and MCP-compatible clients.

## Features
- Search and retrieve Bills, stages, publications, and sittings from the UK Parliament Bills API.
- Access amendments and ping-pong items with structured parameters and enum validation.
- Provide RSS feeds for all, public, or private bills as raw text payloads.
- Preserve upstream JSON payloads in a consistent response envelope for downstream tools and AI agents.

## Available Tools
### search_bill_stage_amendments
Returns a list of amendments for a Bill stage.

Parameters:
- billId (number, path) – Bill ID.
- billStageId (number, path) – Bill stage ID.
- SearchTerm (string, query) – Optional text search.
- AmendmentNumber (string, query) – Optional amendment number.
- Decision (string, query) – Optional decision enum.
- MemberId (number, query) – Optional member ID.
- Skip (number, query) – Optional offset.
- Take (number, query) – Optional limit.

### get_bill_stage_amendment
Returns a specific amendment for a Bill stage.

Parameters:
- billId (number, path) – Bill ID.
- billStageId (number, path) – Bill stage ID.
- amendmentId (number, path) – Amendment ID.

### list_bill_news_articles
Returns news articles for a Bill.

Parameters:
- billId (number, path) – Bill ID.
- Skip (number, query) – Optional offset.
- Take (number, query) – Optional limit.

### list_bill_types
Returns a list of Bill types.

Parameters:
- Category (string, query) – Optional category enum.
- Skip (number, query) – Optional offset.
- Take (number, query) – Optional limit.

### search_bills
Returns a list of Bills matching filters.

Parameters:
- SearchTerm (string, query) – Optional text search.
- Session (number, query) – Optional session number.
- CurrentHouse (string, query) – Optional house enum.
- OriginatingHouse (string, query) – Optional house enum.
- MemberId (number, query) – Optional member ID.
- DepartmentId (number, query) – Optional department ID.
- BillStage (array:number, query) – Optional bill stage IDs.
- BillStagesExcluded (array:number, query) – Optional excluded stage IDs.
- IsDefeated (boolean, query) – Optional defeated filter.
- IsWithdrawn (boolean, query) – Optional withdrawn filter.
- BillType (array:number, query) – Optional bill type IDs.
- SortOrder (string, query) – Optional sort order enum.
- BillIds (array:number, query) – Optional bill IDs.
- IsInAmendableStage (boolean, query) – Optional amendable stage filter.
- Skip (number, query) – Optional offset.
- Take (number, query) – Optional limit.

### get_bill
Returns a Bill.

Parameters:
- billId (number, path) – Bill ID.

### get_bill_stage_details
Returns a Bill stage.

Parameters:
- billId (number, path) – Bill ID.
- billStageId (number, path) – Bill stage ID.

### list_bill_stages
Returns all Bill stages for a Bill.

Parameters:
- billId (number, path) – Bill ID.
- Skip (number, query) – Optional offset.
- Take (number, query) – Optional limit.

### get_publication_document
Returns information on a publication document.

Parameters:
- publicationId (number, path) – Publication ID.
- documentId (number, path) – Document ID.

### download_publication_document
Returns a publication document payload.

Parameters:
- publicationId (number, path) – Publication ID.
- documentId (number, path) – Document ID.

### search_bill_stage_ping_pong_items
Returns a list of motions or amendments for a Bill stage.

Parameters:
- billId (number, path) – Bill ID.
- billStageId (number, path) – Bill stage ID.
- SearchTerm (string, query) – Optional text search.
- AmendmentNumber (string, query) – Optional amendment number.
- Decision (string, query) – Optional decision enum.
- MemberId (number, query) – Optional member ID.
- Skip (number, query) – Optional offset.
- Take (number, query) – Optional limit.

### get_bill_stage_ping_pong_item
Returns an amendment or motion detail.

Parameters:
- billId (number, path) – Bill ID.
- billStageId (number, path) – Bill stage ID.
- pingPongItemId (number, path) – Ping pong item ID.

### list_publication_types
Returns a list of publication types.

Parameters:
- Skip (number, query) – Optional offset.
- Take (number, query) – Optional limit.

### list_bill_publications
Returns Bill publications.

Parameters:
- billId (number, path) – Bill ID.

### list_bill_stage_publications
Returns publications for a Bill stage.

Parameters:
- billId (number, path) – Bill ID.
- stageId (number, path) – Stage ID.

### get_rss_all_bills
Returns an RSS feed for all Bills.

### get_rss_public_bills
Returns an RSS feed for public Bills.

### get_rss_private_bills
Returns an RSS feed for private Bills.

### get_rss_bill_by_id
Returns an RSS feed for a specific Bill.

Parameters:
- id (number, path) – Bill ID.

### search_sittings
Returns a list of sittings.

Parameters:
- House (string, query) – Optional house enum.
- DateFrom (string, query) – Optional start date.
- DateTo (string, query) – Optional end date.
- Skip (number, query) – Optional offset.
- Take (number, query) – Optional limit.

### list_stage_references
Returns a list of Bill stages.

Parameters:
- Skip (number, query) – Optional offset.
- Take (number, query) – Optional limit.

## Example Output
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "billId": 1,
        "title": "Energy Security Bill",
        "currentStage": "Commons Committee",
        "currentHouse": "Commons",
        "lastUpdated": "2026-03-11T10:00:00Z"
      }
    ],
    "totalResults": 1
  },
  "upstream_path": "/api/v1/Bills",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-bills mcp-server-uk-parliament-bills
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-bills": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-bills", "mcp-server-uk-parliament-bills"],
      "env": {
        "UPSTREAM_BASE_URL": "https://bills-api.parliament.uk",
        "REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Example Usage
- List the latest UK Parliament Bills.
- Fetch a specific Bill by ID and return the current stage.
- Retrieve publications for a Bill and download a document.
- Get the RSS feed for public Bills for downstream tools.

## Use Cases
- AI agents summarizing legislative progress and bill status.
- Developer tools that monitor bill updates via the API and RSS.
- Civic technology platforms tracking amendments and parliamentary stages.
- Automation workflows that enrich datasets with UK Parliament Bills metadata.

## Data Source
UK Parliament Bills API
https://bills-api.parliament.uk

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-bills mcp-server-uk-parliament-bills
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run start:http
```

Set a custom HTTP port with the `UKP_HTTP_PORT` environment variable (default: `3000`):

```bash
UKP_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-bills -- mcp-server-uk-parliament-bills-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-bills -- node ./dist/http.js
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
curl "http://127.0.0.1:3000/proxy/api/v1/Bills?SearchTerm=energy&SortOrder=TitleAscending"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: search_bill_stage_amendments, get_bill_stage_amendment, list_bill_news_articles, list_bill_types, search_bills, get_bill, get_bill_stage_details, list_bill_stages, get_publication_document, download_publication_document, search_bill_stage_ping_pong_items, get_bill_stage_ping_pong_item, list_publication_types, list_bill_publications, list_bill_stage_publications, get_rss_all_bills, get_rss_public_bills, get_rss_private_bills, get_rss_bill_by_id, search_sittings, list_stage_references

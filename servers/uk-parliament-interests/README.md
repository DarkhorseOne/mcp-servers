![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Register of Interests MCP Server

# Summary
This MCP server provides structured access to the UK Parliament Register of Interests using the Model Context Protocol.
It enables AI agents to query interest categories, published registers, and interest records through API-backed tools and data access.
Developers can integrate the MCP server via stdio transport to retrieve registers, interests, and PDFs for analysis workflows.
The server exposes tools that map directly to the Register of Interests API, optimized for AI agents and developer tooling.

## Features
- List interest categories and fetch category details by id.
- Retrieve published registers, register PDFs, and register metadata.
- Query interests with filters for members, dates, and categories.
- Preserve upstream payloads in a standardized envelope for downstream tools and AI agents.

## Available Tools
### ukpi_categories_list
Return a list of categories interests should be registered under, sorted by category number.

Parameters:
- Skip (number, query) – Records to skip.
- Take (number, query) – Records to return.

### ukpi_categories_get_by_id
Return details of an interest category by ID.

Parameters:
- id (number, path) – Category id.

### ukpi_interests_list
Return a list of interests that have been published on a register.

Parameters:
- MemberId (number, query)
- CategoryId (number, query)
- PublishedFrom (string, query)
- PublishedTo (string, query)
- RegisteredFrom (string, query)
- RegisteredTo (string, query)
- UpdatedFrom (string, query)
- UpdatedTo (string, query)
- RegisterId (number, query)
- ExpandChildInterests (boolean, query)
- Take (number, query)
- SortOrder (string, query) – PublishingDateDescending | CategoryAscending
- Skip (number, query)

### ukpi_interests_csv
Return interests as CSVs packaged in a ZIP file.

Parameters:
- MemberId (number, query)
- CategoryId (number, query)
- PublishedFrom (string, query)
- PublishedTo (string, query)
- RegisteredFrom (string, query)
- RegisteredTo (string, query)
- UpdatedFrom (string, query)
- UpdatedTo (string, query)
- RegisterId (number, query)
- IncludeFieldDescriptions (boolean, query)

### ukpi_interests_get_by_id
Return the latest version of an interest which has been published.

Parameters:
- id (number, path) – Interest id.

### ukpi_registers_list
Return a list of published versions of registers of interests.

Parameters:
- SessionId (number, query)
- Skip (number, query)
- Take (number, query)

### ukpi_registers_get_by_id
Return a published version of a register of interests by ID.

Parameters:
- id (number, path) – Register id.

### ukpi_registers_document
Return a published register as a PDF document by ID.

Parameters:
- id (number, path) – Register id.
- type (string, query) – Full | Updated

## Example Output
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "interestId": 9876,
        "memberId": 123,
        "categoryId": 2,
        "publishedDate": "2026-03-01"
      }
    ],
    "totalResults": 1
  },
  "upstream_path": "/api/v1/Interests",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-interests mcp-server-uk-parliament-interests
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

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

## Example Usage
- List published interests for a member.
- Fetch a specific interest by id.
- Retrieve registers for a parliamentary session.
- Download the latest register PDF.

## Use Cases
- AI agents summarizing member interests for transparency reporting.
- Compliance workflows tracking published register updates.
- Research tools aggregating interests by category or date.
- Civic technology platforms monitoring register data changes.

## Data Source
UK Parliament Register of Interests API
https://interests-api.parliament.uk/

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-interests mcp-server-uk-parliament-interests
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run start:http
```

Set a custom HTTP port with the `UKPI_HTTP_PORT` environment variable (default: `8787`):

```bash
UKPI_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-interests run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-interests -- mcp-server-uk-parliament-interests-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-interests -- node ./dist/http.js
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
Tools: ukpi_categories_list, ukpi_categories_get_by_id, ukpi_interests_list, ukpi_interests_csv, ukpi_interests_get_by_id, ukpi_registers_list, ukpi_registers_get_by_id, ukpi_registers_document

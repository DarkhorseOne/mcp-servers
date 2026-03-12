![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Erskine May MCP Server

# Summary
This MCP server provides structured access to UK Parliament Erskine May content using the Model Context Protocol.
It enables AI agents to query chapters, parts, sections, and index terms through API-backed tools for reliable data access.
Developers can connect the MCP server via stdio transport to retrieve authoritative procedural guidance and references.
The server exposes tools that map directly to the Erskine May API for search and lookup workflows.

## Features
- Retrieve chapters, parts, sections, and section overviews by identifier.
- Browse and search index terms and paragraphs by keyword.
- Support structured lookups with consistent response envelopes.
- Preserve upstream JSON payloads for downstream tools and AI agents.

## Available Tools
### get_chapter_by_chapter_number
Returns a single chapter overview by chapter number.

Parameters:
- chapterNumber (number, path) – Chapter number.

### browse_index_terms
Returns a list of index terms by start letter.

Parameters:
- startLetter (string, query)
- skip (number, query)
- take (number, query)

### get_index_term_by_index_term_id
Returns an index term by id.

Parameters:
- indexTermId (number, path) – Index term id.

### list_parts
Returns a list of all parts.

### get_part_by_part_number
Returns a part by part number.

Parameters:
- partNumber (number, path) – Part number.

### search_index_term_results_by_search_term
Returns a list of index terms which contain the search term.

Parameters:
- searchTerm (string, path)
- skip (number, query)
- take (number, query)

### get_paragraph_by_reference
Returns a section overview by reference.

Parameters:
- reference (string, path)

### search_paragraph_results_by_search_term
Returns a list of paragraphs which contain the search term.

Parameters:
- searchTerm (string, path)
- skip (number, query)
- take (number, query)

### search_section_results_by_search_term
Returns a list of sections which contain the search term.

Parameters:
- searchTerm (string, path)
- skip (number, query)
- take (number, query)

### get_section_by_section_id
Returns a section by section id.

Parameters:
- sectionId (number, path)

### get_section_overview_by_section_id_and_step
Returns a section overview by section id and step.

Parameters:
- sectionId (number, path)
- step (number, path)

## Example Output
```json
{
  "status": 200,
  "data": {
    "sectionId": 12,
    "title": "Order in debate",
    "content": "..."
  },
  "upstream_path": "/api/Section/12",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-erskinemay mcp-server-uk-parliament-erskinemay
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-erskinemay": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-erskinemay", "mcp-server-uk-parliament-erskinemay"],
      "env": {
        "UPSTREAM_BASE_URL": "https://erskinemay-api.parliament.uk",
        "REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Example Usage
- Fetch a chapter by chapter number.
- Search sections for a keyword and paginate results.
- Retrieve a section overview by id and step.
- Browse index terms starting with a letter.

## Use Cases
- AI agents answering procedural questions with authoritative references.
- Legal or parliamentary research tools mapping sections and paragraphs.
- Civic tech workflows enriching datasets with Erskine May references.
- Automation systems that index procedural content for retrieval.

## Data Source
UK Parliament Erskine May API
https://erskinemay-api.parliament.uk

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-erskinemay mcp-server-uk-parliament-erskinemay
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run start:http
```

Set a custom HTTP port with the `UKP_HTTP_PORT` environment variable (default: `3000`):

```bash
UKP_HTTP_PORT=3000 pnpm --filter @darkhorseone/mcp-server-uk-parliament-erskinemay run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-erskinemay -- mcp-server-uk-parliament-erskinemay-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-erskinemay -- node ./dist/http.js
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
curl "http://127.0.0.1:3000/proxy/api/Part"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: get_chapter_by_chapter_number, browse_index_terms, get_index_term_by_index_term_id, list_parts, get_part_by_part_number, search_index_term_results_by_search_term, get_paragraph_by_reference, search_paragraph_results_by_search_term, search_section_results_by_search_term, get_section_by_section_id, get_section_overview_by_section_id_and_step

![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Statutory Instruments MCP Server

# Summary
This MCP server provides structured access to UK Parliament Statutory Instruments data using the Model Context Protocol.
It enables AI agents to query statutory instruments, procedures, laying bodies, and business items through API-backed tools and data access.
Developers can integrate the MCP server via stdio transport to retrieve instruments across v1 and v2 endpoints.
The server exposes tools that map directly to the Statutory Instruments API for reliable automation and AI agents workflows.

## Features
- Search statutory instruments and proposed negatives with filters for house, procedure, and status.
- Retrieve instrument details, procedures, and business items by ID.
- Access laying bodies and Acts of Parliament through v1 and v2 endpoints.
- Preserve upstream payloads in a standardized envelope for downstream tools.

## Available Tools
### get_v1_business_item_by_id
Returns business item by ID.

Parameters:
- id (string, path)
- LaidPaper (string, query) – StatutoryInstrument | ProposedNegative

### list_v1_laying_bodies
Returns all laying bodies.

### list_v1_procedures
Returns all procedures.

### get_v1_procedure_by_id
Returns procedure by ID.

Parameters:
- id (string, path)

### list_v1_proposed_negative_statutory_instruments
Returns a list of proposed negative statutory instruments.

Parameters:
- Name (string, query)
- RecommendedForProcedureChange (boolean, query)
- DepartmentId (number, query)
- LayingBodyId (string, query)
- Skip (number, query)
- Take (number, query)

### get_v1_proposed_negative_statutory_instrument_by_id
Returns proposed negative statutory instrument by ID.

Parameters:
- id (string, path)

### list_v1_business_items_by_proposed_negative_statutory_instrument_id
Returns business items belonging to a proposed negative statutory instrument.

Parameters:
- id (string, path)

### list_v1_statutory_instruments
Returns a list of statutory instruments.

Parameters:
- Name (string, query)
- StatutoryInstrumentType (string, query) – DraftAffirmative | DraftNegative | MadeAffirmative | MadeNegative
- ScheduledDebate (boolean, query)
- MotionToStop (boolean, query)
- ConcernsRaisedByCommittee (boolean, query)
- ParliamentaryProcessConcluded (string, query) – NotConcluded | Concluded
- DepartmentId (number, query)
- LayingBodyId (string, query)
- House (string, query) – Commons | Lords
- Skip (number, query)
- Take (number, query)

### get_v1_statutory_instrument_by_id
Returns a statutory instrument by ID.

Parameters:
- id (string, path)

### list_v1_business_items_by_statutory_instrument_id
Returns business items belonging to statutory instrument with ID.

Parameters:
- id (string, path)

### list_v2_acts_of_parliament
Search through Acts of Parliament.

Parameters:
- Id (array:string, query)
- Name (string, query)

### get_v2_act_of_parliament_by_id
Search individual Act of Parliament by ID.

Parameters:
- id (string, path)

### list_v2_statutory_instruments
Search through statutory instruments and proposed negatives.

Parameters:
- Name (string, query)
- Procedure (string, query)
- ScheduledDebate (boolean, query)
- MotionToStop (boolean, query)
- ConcernsRaisedByCommittee (boolean, query)
- ParliamentaryProcessConcluded (boolean, query)
- DepartmentId (number, query)
- LayingBodyId (string, query)
- RecommendedForProcedureChange (boolean, query)
- ActOfParliamentId (array:string, query)
- House (string, query) – Commons | Lords
- Skip (number, query)
- Take (number, query)

### get_v2_statutory_instrument_by_instrument_id
Get individual statutory instrument or proposed negative by id.

Parameters:
- instrumentId (string, path)

### list_v2_business_items_by_instrument_id
Get business items associated with a particular instrument.

Parameters:
- instrumentId (string, path)

### list_v2_business_items_by_timeline_id
Get business items associated with a particular timeline.

Parameters:
- timelineId (string, path)

## Example Output
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "instrumentId": "abcd1234",
        "name": "Example Statutory Instrument",
        "house": "Commons"
      }
    ],
    "totalResults": 1
  },
  "upstream_path": "/api/v2/StatutoryInstrument",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-statutoryinstruments mcp-server-uk-parliament-statutoryinstruments
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-statutoryinstruments": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-statutoryinstruments", "mcp-server-uk-parliament-statutoryinstruments"],
      "env": {
        "UPSTREAM_BASE_URL": "https://statutoryinstruments-api.parliament.uk",
        "REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Example Usage
- List statutory instruments laid in the Commons with a name filter.
- Fetch a statutory instrument by ID and inspect its procedure.
- Retrieve business items for an instrument or timeline.
- Search Acts of Parliament linked to statutory instruments.

## Use Cases
- AI agents summarizing statutory instrument status and procedures.
- Research tools tracking instruments by department or house.
- Civic tech platforms monitoring proposed negatives and debates.
- Automation workflows exporting instrument metadata for reporting.

## Data Source
UK Parliament Statutory Instruments API
https://statutoryinstruments-api.parliament.uk

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-statutoryinstruments mcp-server-uk-parliament-statutoryinstruments
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run start:http
```

Set a custom HTTP port with the `UKP_HTTP_PORT` environment variable (default: `8787`):

```bash
UKP_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-statutoryinstruments run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-statutoryinstruments -- mcp-server-uk-parliament-statutoryinstruments-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-statutoryinstruments -- node ./dist/http.js
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
curl "http://127.0.0.1:8787/proxy/api/v2/StatutoryInstrument?House=Commons&Take=10"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: get_v1_business_item_by_id, list_v1_laying_bodies, list_v1_procedures, get_v1_procedure_by_id, list_v1_proposed_negative_statutory_instruments, get_v1_proposed_negative_statutory_instrument_by_id, list_v1_business_items_by_proposed_negative_statutory_instrument_id, list_v1_statutory_instruments, get_v1_statutory_instrument_by_id, list_v1_business_items_by_statutory_instrument_id, list_v2_acts_of_parliament, get_v2_act_of_parliament_by_id, list_v2_statutory_instruments, get_v2_statutory_instrument_by_instrument_id, list_v2_business_items_by_instrument_id, list_v2_business_items_by_timeline_id

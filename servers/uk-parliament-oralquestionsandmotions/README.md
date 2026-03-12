![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Oral Questions and Motions MCP Server

# Summary
This MCP server provides structured access to UK Parliament Oral Questions and Motions data using the Model Context Protocol.
It enables AI agents to retrieve early day motions, oral questions, and question times through API-backed tools and data access.
Developers can integrate the MCP server via stdio transport to query motions, question lists, and answering schedules.
The server exposes tools that map directly to the Oral Questions and Motions API for reliable automation and AI agents workflows.

## Features
- Fetch a single Early Day Motion by ID.
- List Early Day Motions with status, date, and member filters.
- Retrieve oral questions with question type and status filters.
- Query oral question times with answering body and date ranges.

## Available Tools
### get_early_day_motion_by_id
Returns a single Early Day Motion by ID.

Parameters:
- id (number, path)

### list_early_day_motions
Returns a list of Early Day Motions.

Parameters:
- parameters.edmIds (array:number, query)
- parameters.uINWithAmendmentSuffix (string, query)
- parameters.searchTerm (string, query)
- parameters.currentStatusDateStart (string, query)
- parameters.currentStatusDateEnd (string, query)
- parameters.isPrayer (boolean, query)
- parameters.memberId (number, query)
- parameters.includeSponsoredByMember (boolean, query)
- parameters.tabledStartDate (string, query)
- parameters.tabledEndDate (string, query)
- parameters.statuses (array:string, query) – Published | Withdrawn
- parameters.orderBy (string, query) – DateTabledAsc | DateTabledDesc | TitleAsc | TitleDesc | SignatureCountAsc | SignatureCountDesc
- parameters.skip (number, query)
- parameters.take (number, query)

### list_oral_questions
Returns a list of oral questions.

Parameters:
- parameters.answeringDateStart (string, query)
- parameters.answeringDateEnd (string, query)
- parameters.questionType (string, query) – Substantive | Topical
- parameters.oralQuestionTimeId (number, query)
- parameters.statuses (array:string, query)
- parameters.askingMemberIds (array:number, query)
- parameters.uINs (array:number, query)
- parameters.answeringBodyIds (array:number, query)
- parameters.skip (number, query)
- parameters.take (number, query)

### list_oral_question_times
Returns a list of oral question times.

Parameters:
- parameters.answeringDateStart (string, query)
- parameters.answeringDateEnd (string, query)
- parameters.deadlineDateStart (string, query)
- parameters.deadlineDateEnd (string, query)
- parameters.oralQuestionTimeId (number, query)
- parameters.answeringBodyIds (array:number, query)
- parameters.skip (number, query)
- parameters.take (number, query)

## Example Output
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "edmId": 2044,
        "title": "Example motion",
        "status": "Published",
        "dateTabled": "2026-03-10"
      }
    ],
    "totalResults": 1
  },
  "upstream_path": "/EarlyDayMotions/list",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions mcp-server-uk-parliament-oralquestionsandmotions
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-oralquestionsandmotions": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions", "mcp-server-uk-parliament-oralquestionsandmotions"],
      "env": {
        "UPSTREAM_BASE_URL": "https://oralquestionsandmotions-api.parliament.uk",
        "REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Example Usage
- Fetch an Early Day Motion by ID.
- List oral questions for a given answering date range.
- Query oral question times for specific answering bodies.
- Filter motions by status, member, and tabled dates.

## Use Cases
- AI agents summarizing current oral questions and motions.
- Monitoring dashboards for question schedules and EDMS.
- Civic tech tools tracking motions and topical questions.
- Automation workflows exporting questions for reporting.

## Data Source
UK Parliament Oral Questions and Motions API
https://oralquestionsandmotions-api.parliament.uk

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions mcp-server-uk-parliament-oralquestionsandmotions
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run start:http
```

Set a custom HTTP port with the `UKP_HTTP_PORT` environment variable (default: `8787`):

```bash
UKP_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions -- mcp-server-uk-parliament-oralquestionsandmotions-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions -- node ./dist/http.js
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
curl "http://127.0.0.1:8787/proxy/EarlyDayMotion/2044"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: get_early_day_motion_by_id, list_early_day_motions, list_oral_questions, list_oral_question_times

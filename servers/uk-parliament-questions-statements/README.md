![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Questions and Statements MCP Server

# Summary
This MCP server provides structured access to UK Parliament Questions and Statements data using the Model Context Protocol.
It enables AI agents to retrieve daily reports, written questions, and written statements through API-backed tools and data access.
Developers can integrate the MCP server via stdio transport to search questions, filter by session status, and fetch statement details.
The server exposes tools that map directly to the Questions and Statements API for reliable automation and AI agents workflows.

## Features
- List daily reports with date and house filters.
- Search written questions with answering, member, and session filters.
- Retrieve written questions and statements by id or date/uin.
- Preserve upstream payloads in a standardized envelope for downstream tools.

## Available Tools
### list_daily_reports
Returns a list of daily reports.

Parameters:
- dateFrom (string, query)
- dateTo (string, query)
- house (string, query) – Bicameral | Commons | Lords
- skip (number, query)
- take (number, query)

### list_written_questions
Returns a list of written questions.

Parameters:
- askingMemberId (number, query)
- answeringMemberId (number, query)
- tabledWhenFrom (string, query)
- tabledWhenTo (string, query)
- dateForAnswerWhenFrom (string, query)
- dateForAnswerWhenTo (string, query)
- answered (string, query) – Any | Answered | Unanswered
- answeredWhenFrom (string, query)
- answeredWhenTo (string, query)
- questionStatus (string, query) – NotAnswered | AnsweredOnly | AllQuestions
- includeWithdrawn (boolean, query)
- expandMember (boolean, query)
- correctedWhenFrom (string, query)
- correctedWhenTo (string, query)
- sessionStatus (string, query) – Current | Any
- searchTerm (string, query)
- uIN (string, query)
- answeringBodies (array:number, query)
- members (array:number, query)
- house (string, query) – Bicameral | Commons | Lords
- skip (number, query)
- take (number, query)

### get_written_question_by_id
Returns a written question.

Parameters:
- id (number, path)
- expandMember (boolean, query)
- sessionStatus (string, query) – Current | Any

### get_written_question_by_date_and_uin
Returns a written question.

Parameters:
- date (string, path)
- uin (string, path)
- expandMember (boolean, query)
- sessionStatus (string, query) – Current | Any

### list_written_statements
Returns a list of written statements.

Parameters:
- madeWhenFrom (string, query)
- madeWhenTo (string, query)
- sessionStatus (string, query) – Current | Any
- searchTerm (string, query)
- uIN (string, query)
- answeringBodies (array:number, query)
- members (array:number, query)
- house (string, query) – Bicameral | Commons | Lords
- skip (number, query)
- take (number, query)
- expandMember (boolean, query)

### get_written_statement_by_id
Returns a written statement.

Parameters:
- id (number, path)
- expandMember (boolean, query)
- sessionStatus (string, query) – Current | Any

### get_written_statement_by_date_and_uin
Returns a written statement.

Parameters:
- date (string, path)
- uin (string, path)
- expandMember (boolean, query)
- sessionStatus (string, query) – Current | Any

## Example Output
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "id": 12345,
        "uin": "12345",
        "title": "Example written question",
        "house": "Commons"
      }
    ],
    "totalResults": 1
  },
  "upstream_path": "/api/writtenquestions/questions",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-questions-statements mcp-server-uk-parliament-questions-statements
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-questions-statements": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-questions-statements", "mcp-server-uk-parliament-questions-statements"],
      "env": {
        "UPSTREAM_BASE_URL": "https://questions-statements-api.parliament.uk",
        "REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Example Usage
- List daily reports for the Commons over a date range.
- Search written questions by member and session status.
- Retrieve a written statement by id or date/uin.
- Filter questions by answered status and house.

## Use Cases
- AI agents summarizing written questions and statements.
- Research tools tracking parliamentary questions over time.
- Civic tech platforms monitoring statements by department.
- Automation workflows exporting daily report data.

## Data Source
UK Parliament Questions and Statements API
https://questions-statements-api.parliament.uk

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-questions-statements mcp-server-uk-parliament-questions-statements
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run start:http
```

Set a custom HTTP port with the `UKP_HTTP_PORT` environment variable (default: `8787`):

```bash
UKP_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-questions-statements -- mcp-server-uk-parliament-questions-statements-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-questions-statements -- node ./dist/http.js
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
curl "http://127.0.0.1:8787/proxy/api/writtenquestions/questions?searchTerm=health&take=10"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: list_daily_reports, list_written_questions, get_written_question_by_id, get_written_question_by_date_and_uin, list_written_statements, get_written_statement_by_id, get_written_statement_by_date_and_uin

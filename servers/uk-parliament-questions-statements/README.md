# @darkhorseone/mcp-server-uk-parliament-questions-statements

MCP server package for the UK Parliament Questions and Statements API.

- Source API (official): https://questions-statements-api.parliament.uk

This package provides:

- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-questions-statements`
- Version: `1.0.0`
- Runtime: Node.js (ESM)

## What it exposes

Tools generated from Questions and Statements API endpoints (`GET` only):

1. `list_daily_reports`
2. `list_written_questions`
3. `get_written_question_by_id`
4. `get_written_question_by_date_and_uin`
5. `list_written_statements`
6. `get_written_statement_by_id`
7. `get_written_statement_by_date_and_uin`

Typed parameter handling for:

- `string`
- `number`
- `boolean`
- `array:string`
- `array:number`

## Environment variables

- `UPSTREAM_BASE_URL` (default: `https://questions-statements-api.parliament.uk`)
- `REQUEST_TIMEOUT_MS` (default: `10000`)
- `UKP_HTTP_PORT` (HTTP mode only, default: `8787`)

## Install

From repository root:

```bash
pnpm install
```

## Build

From repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-questions-statements mcp-server-uk-parliament-questions-statements
```

## Run (HTTP proxy server)

Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-questions-statements mcp-server-uk-parliament-questions-statements-http
```

Health check:

```bash
curl http://127.0.0.1:8787/healthz
```

Proxy pattern:

```text
GET /proxy/<upstream-path>?<query>
```

Examples:

```bash
curl "http://127.0.0.1:8787/proxy/api/dailyreports/dailyreports?take=5"
curl "http://127.0.0.1:8787/proxy/api/writtenquestions/questions?searchTerm=health&take=10"
```

## Inspect with MCP Inspector

Local build:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run inspect:local
```

Published package:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run inspect:npm
```

## Quality checks

Run package-scoped checks from repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run build
```

## Compatibility note on response models

The source swagger contains response schema references that do not always align with the list endpoints. This package does not force endpoint-specific response deserialization.

Compatibility strategy in this package:

- request/parameter mapping strictly follows `paths` definitions,
- enum constraints are enforced for enum-backed parameters,
- upstream JSON payload is preserved in `data` as returned by API.

This ensures robust behavior even when swagger response `$ref` metadata is inconsistent.

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

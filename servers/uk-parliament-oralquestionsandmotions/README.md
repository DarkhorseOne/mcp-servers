# @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions

MCP server package for the UK Parliament Oral Questions and Motions API.

- Source API (official): https://oralquestionsandmotions-api.parliament.uk

This package provides:

- a **stdio MCP server** entrypoint (for MCP clients), and
- an optional **HTTP proxy server** entrypoint (for local/ops-style access).

## Package

- Name: `@darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions`
- Version: `1.0.0`
- Runtime: Node.js (ESM)

## What it exposes

Tools generated from Oral Questions and Motions API endpoints (`GET` only):

1. `get_early_day_motion_by_id`
2. `list_early_day_motions`
3. `list_oral_questions`
4. `list_oral_question_times`

Typed parameter handling for:

- `string`
- `number`
- `boolean`
- `array:string`
- `array:number`

## Environment variables

- `UPSTREAM_BASE_URL` (default: `https://oralquestionsandmotions-api.parliament.uk`)
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
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run build
```

## Run (stdio MCP server)

Development mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run dev
```

Built mode:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions exec node dist/index.js
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions mcp-server-uk-parliament-oralquestionsandmotions
```

## Run (HTTP proxy server)

Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions mcp-server-uk-parliament-oralquestionsandmotions-http
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
curl "http://127.0.0.1:8787/proxy/EarlyDayMotion/2044"
curl "http://127.0.0.1:8787/proxy/oralquestions/list?parameters.questionType=Topical&parameters.take=10"
```

## Inspect with MCP Inspector

Local build:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run inspect:local
```

Published package:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run inspect:npm
```

## Quality checks

Run package-scoped checks from repository root:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run build
```

## Compatibility note on response models

The source swagger contains some response schema references that are inconsistent with endpoint semantics (for example, list endpoints referencing `PublishedWrittenQuestion` in multiple places).

Compatibility strategy in this package:

- request/parameter mapping strictly follows `paths` definitions,
- runtime does **not** force endpoint-specific response deserialization,
- upstream JSON payload is preserved in `data` as returned by API.

This ensures robust behavior even when swagger response `$ref` metadata is inconsistent.

## Package metadata

- License: MIT
- Repository: https://github.com/DarkhorseOne/mcp-servers
- Author: DarkhorseOne Limited

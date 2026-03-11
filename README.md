# MCP Servers (monorepo)

This repository is a **pnpm workspace** for MCP server packages maintained by **DarkhorseOne Limited**.

## Implemented MCP servers

The following MCP servers are currently implemented under `servers/`:

| Server slug | npm package | Description | Local version | npm published status |
| --- | --- | --- | --- | --- |
| `uk-parliament-members` | `@darkhorseone/mcp-server-uk-parliament-members` | MCP server for UK Parliament Members API | `1.0.1` | ✅ Published `1.0.1` |
| `uk-parliament-interests` | `@darkhorseone/mcp-server-uk-parliament-interests` | MCP server for UK Parliament Register of Interests API | `1.0.0` | ✅ Published `1.0.0` |
| `uk-parliament-oralquestionsandmotions` | `@darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions` | MCP server for UK Parliament Oral Questions and Motions API | `1.0.0` | ✅ Published `1.0.0` |
| `uk-parliament-commonsvotes` | `@darkhorseone/mcp-server-uk-parliament-commonsvotes` | MCP server for UK Parliament Commons Votes API | `1.0.0` | ✅ Published `1.0.0` |
| `uk-parliament-lordsvotes` | `@darkhorseone/mcp-server-uk-parliament-lordsvotes` | MCP server for UK Parliament Lords Votes API | `0.1.0` | ✅ Published `1.0.0` |
| `uk-parliament-statutoryinstruments` | `@darkhorseone/mcp-server-uk-parliament-statutoryinstruments` | MCP server for UK Parliament Statutory Instruments API | `1.0.0` | ✅ Published `1.0.0` (an hour ago) |
| `uk-parliament-treaties` | `@darkhorseone/mcp-server-uk-parliament-treaties` | MCP server for UK Parliament Treaties API | `1.0.0` | ✅ Published `1.0.0` (a few seconds ago) |

## Requirements

- Node.js (recent LTS recommended)
- pnpm (this repo pins a version via `packageManager`)

## Getting started

```bash
pnpm install
```

## Common commands

All scripts are run from the repo root:

```bash
# Lint all workspace packages
pnpm run lint

# Typecheck all workspace packages
pnpm run typecheck

# Run tests across the workspace
pnpm run test

# Build all workspace packages
pnpm run build

# Run everything (lint, typecheck, test, build)
pnpm run check

# Clean dist outputs in packages
pnpm run clean
```

### Dev shortcuts

If the corresponding workspace package exists, these will run its `dev` script:

```bash
pnpm run dev:gov-uk
pnpm run dev:companies-house
```

## Workspace layout

Workspace package globs are defined in `pnpm-workspace.yaml`:

- `servers/*`
- `packages/*`

Each workspace package should provide its own `lint`, `typecheck`, `test`, and `build` scripts where applicable.

## TypeScript

Shared TypeScript defaults live in `tsconfig.base.json`.
Workspace packages can extend it, for example:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## Publishing

This repo includes Changesets tooling (`@changesets/cli`) for versioning and publishing workspace packages.

```bash
pnpm run changeset
pnpm run version:packages
pnpm run publish:packages
```

### Generic npm publish commands

Use these when publishing a single package directly:

```bash
# Check current npm user status. 
# If shows, run npm login:
# npm error code E401
# npm error 401 Unauthorized - GET https://registry.npmjs.org/-/whoami
npm whoami
# From the package directory
npm publish --access public

# Or from repo root (workspace filtered)
pnpm --filter <workspace-package-name> publish --access public
```

## License

Copyright (c) DarkhorseOne Limited.

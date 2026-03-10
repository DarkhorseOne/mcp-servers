# MCP Servers (monorepo)

This repository is a **pnpm workspace** for MCP server packages maintained by **DarkhorseOne Limited**.

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
# From the package directory
npm publish --access public

# Or from repo root (workspace filtered)
pnpm --filter <workspace-package-name> publish --access public
```

## License

Copyright (c) DarkhorseOne Limited.

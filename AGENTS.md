# AGENTS.md

Repository guide for autonomous coding agents operating in:
`/Users/nickma/Develop/darkhorseone/system/MCPServers`

## 1) Repository Snapshot (Current State)

- This is a **pnpm workspace root**.
- Workspace package globs are defined in `pnpm-workspace.yaml`:
  - `servers/*`
  - `packages/*`
- In the current checkout, only root scaffold/config files exist.
- There is **no existing `AGENTS.md`** in this repo (created by this change).
- No Cursor/Copilot rule files were found:
  - No `.cursorrules`
  - No `.cursor/rules/`
  - No `.github/copilot-instructions.md`

## 2) Toolchain and Runtime

- Package manager: `pnpm@10.17.1` (from `package.json#packageManager`)
- Language/tooling seen at root:
  - TypeScript (`typescript`)
  - Vitest (`vitest`)
  - tsup (`tsup`)
  - tsx (`tsx`)
  - Changesets (`@changesets/cli`)
- `.npmrc` settings:
  - `auto-install-peers=true`
  - `strict-peer-dependencies=false`

## 3) Canonical Commands (Run from Repo Root)

Use these root scripts as the source of truth:

```bash
pnpm install
pnpm run install:all
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run check
pnpm run clean
```

Script meanings (`package.json`):

- `install:all`: `pnpm install`
- `lint`: `pnpm -r run lint` (recursive across workspace)
- `typecheck`: `pnpm -r run typecheck`
- `test`: `pnpm -r run test`
- `build`: `pnpm -r run build`
- `check`: lint + typecheck + test + build (in sequence)
- `clean`: `pnpm -r exec rimraf dist`

## 4) Single-Package / Single-Test Execution

Because root scripts run recursively, target one workspace package using `--filter`.

### Single package

```bash
pnpm --filter <workspace-package-name> run lint
pnpm --filter <workspace-package-name> run typecheck
pnpm --filter <workspace-package-name> run test
pnpm --filter <workspace-package-name> run build
```

### Single test (framework args passthrough)

The exact per-test flag depends on each package's test script, but the pattern is:

```bash
pnpm --filter <workspace-package-name> run test -- <test-runner-args>
```

Typical Vitest-style examples (when package scripts use Vitest):

```bash
pnpm --filter <pkg> run test -- path/to/file.test.ts
pnpm --filter <pkg> run test -- -t "test name"
pnpm --filter <pkg> run test -- path/to/file.test.ts -t "test name"
```

Use this approach instead of running workspace-wide `pnpm run test` when iterating.

## 5) Dev Shortcuts Present at Root

```bash
pnpm run dev:gov-uk
pnpm run dev:companies-house
```

These map to filtered package `dev` scripts:

- `@darkhorseone/mcp-server-gov-uk`
- `@darkhorseone/mcp-server-companies-house`

## 6) TypeScript and Type Safety Rules

Base TS config is `tsconfig.base.json`. Packages should extend it.

Key compiler constraints:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `isolatedModules: true`
- `module: "NodeNext"`
- `moduleResolution: "NodeNext"`
- `target: "ES2022"`, `lib: ["ES2022"]`
- `resolveJsonModule: true`
- declaration/source maps enabled

Agent expectations:

- Do not weaken strictness to make code compile.
- Prefer proper narrowing and explicit typing over unsafe casts.
- Keep emitted output to package `dist/` conventions.
- Preserve ESM/NodeNext import semantics.

## 7) Code Style Guidance (Repository-Scoped)

This checkout has no root ESLint/Prettier/Biome config files.
Therefore, apply the following **conservative defaults** until package-level rules are present:

- Keep imports explicit and deterministic.
- Group imports by source (built-in, external, internal) with stable ordering.
- Prefer named exports unless module pattern strongly suggests default export.
- Use descriptive names (avoid 1-letter names except tight loop indices).
- Functions/variables: `camelCase`.
- Types/interfaces/classes: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants; else `camelCase`.
- Keep functions small and single-purpose.
- Avoid hidden side effects; return values explicitly.

## 8) Error Handling and Reliability

- Never use empty `catch` blocks.
- Include actionable error context when rethrowing/logging.
- Fail fast on invalid input at module boundaries.
- For async flows, surface errors with enough context to debug quickly.
- Do not silence TypeScript errors via `@ts-ignore`/`@ts-expect-error`.

## 9) Test and Change Workflow for Agents

When changing code in any workspace package:

1. Run the most targeted command first (filtered package / single test).
2. Run package-level lint/typecheck/test/build.
3. Run root-level `pnpm run check` before finishing significant work.

Suggested command ladder:

```bash
pnpm --filter <pkg> run test -- <targeted-args>
pnpm --filter <pkg> run lint
pnpm --filter <pkg> run typecheck
pnpm --filter <pkg> run build
pnpm run check
```

## 10) Files to Consult Before Large Changes

- `package.json` (root scripts + toolchain)
- `pnpm-workspace.yaml` (workspace layout)
- `tsconfig.base.json` (TS constraints)
- `README.md` (repo-level workflows)
- Package-local `package.json`/`tsconfig`/test configs (when present)

## 11) Notes on Missing Rule Sources

No Cursor/Copilot instruction files currently exist in this checkout.
If they are added later, treat them as first-class constraints and update this file.

---

If repository structure changes (new packages, lint config, formatter config, CI scripts),
update this document immediately so agents continue to act on accurate guidance.

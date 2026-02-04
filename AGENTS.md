# AGENTS

This repo is a small Bun + TypeScript CLI utility. Use this guide to keep
changes consistent, safe, and easy to review.

## Project layout

- `src/index.ts` is the CLI entrypoint and dispatcher.
- `src/anytoexport.ts` and `src/svgtotsx.ts` are the primary commands.
- `src/utils.ts` holds shared helpers and formatting logic.
- `src/constants.ts` centralizes flags and help text.
- `build.ts` is a helper for local PATH setup.

## Build, run, and test

This repository uses Bun. There is no configured lint or test runner yet.

### Install

- `bun install`

### Run (development)

- `bun run dev` (runs `src/index.ts`)
- Example: `bun run dev -- -svg2tsx ./icons`
- Example: `bun run dev -- -img2export ./icons ./index.ts`

### Build

- `bun run build` (builds a native Bun binary to `bin/cozyutils`)
- `bun run build:install` (installs to `~/.cozyutils/bin` + PATH helper)
- `bun run build:mac` (macOS install using zsh)
- `bun run build:js` (builds a JS bundle into `dist/`)

### Lint / format

- Not configured.
- If you add a tool, document `lint` and `lint:fix` scripts here.

### Tests

- Not configured.
- Single-test guidance: n/a until a test runner is added.
- If you add tests, include a single-test command here.

## TypeScript configuration notes

The project uses strict TypeScript with the following highlights:

- `strict: true` and `skipLibCheck: true`
- `moduleResolution: bundler` and `module: ESNext`
- `jsx: react-jsx` (used for generated SVG TSX)
- `noEmit: true` (builds are done by Bun, not `tsc`)

## Code style guidelines

Follow existing patterns in `src/*.ts` and `build.ts`. Keep edits minimal
and consistent with the CLI-style ergonomics.

### Imports

- Use ESM imports everywhere.
- Prefer node built-ins via `node:` protocol.
- Group imports in this order:
  1. Third-party libraries (e.g. `bun`, `react`)
  2. Node built-ins (`node:fs/promises`, `node:path`)
  3. Local files (`./utils`)
- Avoid unused imports; remove when logic changes.

### Formatting

- 2-space indentation, no tabs.
- Prefer double quotes for strings (match existing files).
- Keep lines short when possible; wrap long arguments.
- Use trailing semicolons consistently.
- Keep blank lines between logical sections, not between tiny statements.

### Types

- Use explicit parameter and return types for exported functions.
- Avoid `any`; prefer `unknown` + type guards if needed.
- Use `string[]` or `Array<T>` consistently, keep it simple.
- Prefer `Record<string, string>` for plain maps.
- Avoid widening types with implicit `any` in callbacks.

### Naming

- `camelCase` for variables and functions.
- `PascalCase` for React component names.
- `SCREAMING_SNAKE_CASE` only for true constants.
- Keep CLI flags and usage strings in `src/constants.ts`.
- Use descriptive names for file path variables (`inputPath`, `outputPath`).

### Async and I/O

- Prefer async/await over chained promises.
- Use `Bun.file`, `Bun.write`, and `node:fs/promises` consistently.
- Avoid mixing sync and async fs APIs in the same module.
- Validate paths before reads/writes; return early on missing inputs.

### Error handling

- Prefer early returns for invalid input/flags.
- Log user-facing errors with `console.write` or `console.error`.
- For file operations, handle missing files/directories gracefully.
- Avoid throwing raw errors from CLI paths; print a message instead.
- Use non-zero exit codes only if a command cannot continue safely.

### CLI behavior

- Keep `src/index.ts` as the dispatcher; avoid heavy logic there.
- Each CLI action should live in its own module.
- Keep help and usage strings centralized in `src/constants.ts`.
- Prefer flags that are short and consistent across commands.

### Generated code

- `svgtotsx` outputs TSX that uses `React.JSX.IntrinsicElements["svg"]`.
- Keep formatting clean and stable to avoid churn in generated files.
- Preserve attribute normalization rules (`fill`, `stroke`, `props` spread).
- Avoid adding runtime dependencies to generated output.

### Configuration and metadata

- Keep `package.json` scripts minimal and task-focused.
- If adding a tool, update this document with usage and single-test command.
- Use `node:` protocol for new built-in imports.

## Repo-specific notes

- There are no Cursor rules in `.cursor/rules/` or `.cursorrules`.
- There are no Copilot instructions in `.github/copilot-instructions.md`.
- If you add any of these, update this file accordingly.

## Suggested future additions

- Add a lint tool (Biome/ESLint) and document `lint` and `lint:fix` scripts.
- Add a test runner (Bun test or Vitest) and document single-test command.

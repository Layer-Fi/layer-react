---
name: install-dev-mocks
description: Install (or remove) the dev-only mock-registry infrastructure in a layer-react checkout without committing. Drops in `src/types/vite.d.ts`, `src/utils/shared/api/mockRegistry.ts`, patches `src/utils/shared/api/authenticatedHttp.ts` to intercept requests, adds a dev-only mock import to `src/index.tsx`, and forces `import.meta.env.DEV = true` for `vite build --watch` in `vite.config.ts`. Hides the changes from `git status`.
---

# Install Dev Mocks

Adds (or removes) a URL-matching mock registry so SWR hooks in layer-react can return mock payloads during development without any hook/call-site changes. Everything is gated by `import.meta.env.DEV`, so the infrastructure is dead-code-eliminated at `vite build`.

Note: `npm run dev` in layer-react runs `vite build --watch`, for which Vite statically sets `import.meta.env.DEV = false` by default. The install therefore also patches `vite.config.ts` to override `DEV` to `true` when `isWatch`, so the mock branch actually runs during local development.

Importantly, the script also hides the local changes from git:
- New files are added to `.git/info/exclude` (untracked, invisible to `git status`).
- Edits to tracked files (`authenticatedHttp.ts`, `index.tsx`, `vite.config.ts`) are marked with `git update-index --skip-worktree`.

## Arguments
- `$ARGUMENTS` — one of:
  - `install` (default) — apply the changes
  - `uninstall` — revert everything
  - `status` — show current install state
  - Optionally followed by `--path <layer-react-root>` (defaults to the current working directory)

## Instructions

1. **Before running any script**, print this 3-step explainer verbatim so the user understands what's about to happen:

   > **How the mocking setup works on layer-react**
   >
   > 1. **Registry + HTTP-layer intercept.** A dev-only `mockRegistry` (new file) lets you `registerMock(urlMatcher, responseFactory)`. `authenticatedHttp.get()` is patched to check the registry and short-circuit `fetch` when a URL matches. Hooks and call-sites are untouched; mocks flow through the same Effect Schema decode as real responses, so mocks must be in raw API shape (snake_case keys, ISO date strings).
   >
   > 2. **Dev-only loader + build-time strip.** `src/index.tsx` gets a `if (import.meta.env.DEV) { void import('./mocks/<feature>') }` block. Every mock code path is gated by `import.meta.env.DEV`, which Vite replaces at build time — production `npm run build` dead-code-eliminates the entire registry, the intercept, and the dynamic import.
   >
   > 3. **Vite watch override + uncommittable changes.** `npm run dev` runs `vite build --watch`, which Vite treats as production (`DEV=false`). Install patches `vite.config.ts` with `define: isWatch ? { 'import.meta.env.DEV': 'true' } : undefined` so mocks actually run locally. New files go into `.git/info/exclude`; the three patched tracked files get `git update-index --skip-worktree`. Nothing shows in `git status`.

2. Parse `$ARGUMENTS`. Resolve the target directory (default: cwd). Confirm it's a layer-react checkout by checking for `src/utils/shared/api/authenticatedHttp.ts` and `src/index.tsx`.
3. Run the bundled script:
   ```bash
   bash .agents/skills/install-dev-mocks/install.sh <install|uninstall|status> [--path <dir>]
   ```
   (Run from the layer-react repo root, or pass the absolute path to the script.)
4. Report what the script did. On `install`, remind the user:
   - Mock payloads go in `src/mocks/<feature>.ts` using `registerMock(url => url.includes('/your/endpoint'), () => ({ data: rawShape }))`.
   - Register each new mock file with a dev-only dynamic import inside the existing `if (import.meta.env.DEV)` block of `src/index.tsx`.
   - Mocks must be in raw API shape (snake_case keys, ISO date strings) — the Effect Schema decode still runs over them.
   - **Restart `npm run dev`** — Vite resolves `define` at startup, not via HMR.
5. On `uninstall`, run `git status` afterward to confirm the working tree is clean.
6. At the very end of your response (install, uninstall, or status), print:

   > For the full design rationale (thunk rewrite, import-line marker, vite wrinkle), see:
   > `.agents/skills/install-dev-mocks/README.md`

## Caveats
- The tracked-file edits use `git update-index --skip-worktree` on `authenticatedHttp.ts`, `index.tsx`, and `vite.config.ts`. If upstream changes any of those, `git pull` may fail with a local-changes error. Run `uninstall` before pulling in that case, then reinstall.
- The script refuses to install if it detects existing local modifications to those files without our markers — resolve those first.
- Restart the vite watcher (`npm run dev`) after install/uninstall; Vite's `define` replacement is resolved at startup, not via HMR.

## Example Usage
- `/install-dev-mocks` → installs into the current directory
- `/install-dev-mocks install --path ~/git/layer-react` → installs into a specific checkout
- `/install-dev-mocks uninstall` → reverts everything
- `/install-dev-mocks status` → prints which pieces are currently applied

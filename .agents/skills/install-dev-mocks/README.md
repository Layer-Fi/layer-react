# install-dev-mocks — How it works

## Why this exists

Layer-react is a published component library with SWR-based API hooks. Feature work often needs to render against mock payloads (design iteration, backends not yet deployed). A per-hook `useMockData` prop leaks dev concerns into hook/call-site code that eventually ships. This skill replaces that pattern with a URL-matching mock registry that intercepts at the HTTP layer, requires zero hook or call-site changes, and is stripped at production build time.

## Design in three moves

### 1. A registry gated by `import.meta.env.DEV`

`src/utils/api/mockRegistry.ts` exposes `registerMock(urlMatcher, responseFactory)` and `findMockResponse(url)`. Both early-return when `import.meta.env.DEV` is false. Vite replaces `import.meta.env.DEV` statically at build time, so the registry body and every caller become dead code that Rollup eliminates from the production bundle.

### 2. Interception inside `authenticatedHttp.get()`

A single check at the top of the returned thunk short-circuits `fetch`:

```ts
if (import.meta.env.DEV) {
  const mocked = findMockResponse(fullUrl)
  if (mocked !== undefined) return Promise.resolve(mocked as Return)
}
return fetch(fullUrl, ...)
```

Hooks and call-sites are unchanged. The mock flows through the same `.then(Schema.decode...)` pipeline as a real response, so mocks must be in raw API shape (snake_case keys, ISO date strings). The deliberate cost: mocks exercise the decode logic, so shape typos surface as decode errors rather than silent UI bugs.

### 3. Dev-only loader in `src/index.tsx`

```ts
if (import.meta.env.DEV) {
  void import('./mocks/<feature>')
}
```

The dynamic import is inside the `DEV` guard, so production builds never emit the mocks chunk. Each feature drops a `src/mocks/<feature>.ts` file that calls `registerMock(...)` for its endpoints.

## The vite.config.ts wrinkle

`npm run dev` runs `vite build --watch`, which Vite treats as production (`DEV=false`). Without an override the mock branch would be eliminated from the dev bundle too. Install patches `vite/vite.config.ts` with `define: isWatch ? { 'import.meta.env.DEV': 'true' } : undefined` — watch mode flips `DEV=true`, regular `npm run build` is unaffected.

## Keeping changes out of git

New files (`mockRegistry.ts`, `vite.d.ts`, `src/mocks/`) go into `.git/info/exclude` — a local-only ignore list. Tracked-file edits (`authenticatedHttp.ts`, `index.tsx`, `vite/vite.config.ts`) get `git update-index --skip-worktree`, which tells git to pretend they're unchanged. Trade-off: `git pull` may fail when upstream changes a skipped file. Workflow: `uninstall` → `pull` → `install`.

## Why the install script does some surgery

- **Thunk rewrite in `authenticatedHttp.ts`.** Upstream `get()` is `(): Promise<Return> => fetch(...)` — an expression-body arrow. You can't prepend an `if` statement there, so the script rewrites the thunk to a block body with explicit `return fetch(...)` and a closing brace. Revert is the exact inverse.
- **Inline marker on the import line.** eslint `import/order` auto-fix re-sorts imports and ignores adjacent comment lines, stranding wrapper markers. The script tags the import itself with a trailing `// install-dev-mocks:import`, which eslint keeps attached when re-sorting. Revert drops the line matching that tag.

## Install / uninstall / status

```
install.sh install   [--path <layer-react-root>]
install.sh uninstall [--path <layer-react-root>]
install.sh status    [--path <layer-react-root>]
```

`install` is idempotent. `uninstall` reverses every patch and un-skip-worktrees each file. `status` reports which pieces are applied.

On `uninstall`, user-authored mock files under `src/mocks/` are **moved** to `/tmp/layer-react/mocks/` with a `YYYY-MM-DD-<filename>.ts` prefix before the directory is removed — nothing is deleted outright. Same-day collisions get a `-2`, `-3`, … suffix. The scaffold `README.md` is discarded. Copy archives back into `src/mocks/` after the next install to resume where you left off.

## Known limitations

- Layer-react only; paths and vite-config shape are hard-coded.
- `skip-worktree` + upstream edits to the three patched files breaks `git pull`. Uninstall first, pull, reinstall.
- Restart `npm run dev` after install/uninstall — Vite resolves `define` at startup, not via HMR.
- Mocks must match raw (pre-decode) API shape. Post-decode CalendarDate/Date instances will fail Schema decode.

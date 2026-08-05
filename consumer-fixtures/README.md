# Consumer fixtures

Tiny throwaway apps that install the **packed tarball** of `@layerfi/components` the way a customer
would, rather than importing from `src/`. They exist because the repo's own tests can pass while the
published package is broken: a missing `exports` condition, a file left out of `files`, a top-level
`window` reference, or a declaration file that only resolves under one module resolution mode are all
invisible to `vitest` and to `build.yml`'s "does `dist/` contain four non-empty files" check.

Run them with:

```
npm run test:consumers              # all fixtures
npm run test:consumers -- --fixture vite-esm
npm run test:consumers -- --skip-build   # reuse the existing dist/
```

| fixture | what it proves |
|---|---|
| `vite-esm` | `import` condition resolves, `@layerfi/components/index.css` resolves, the bundle builds, and the provider mounts in a real browser under `StrictMode` with no console errors |
| `cjs-require` | `require('@layerfi/components')` resolves and executes, and `dist/index.d.ts` type-checks under `moduleResolution: node16` |
| `ssr-node` | the module graph has no top-level `window`/`document` access and renders through `react-dom/server` |

Each fixture's `node_modules`, lockfile, and build output are gitignored — they are installed fresh by
the script from the tarball under test.

## Adding a fixture

Create a directory with a `package.json` that has a `verify` script and whatever deps it needs, then
add it to `FIXTURES` in `scripts/pack-and-test-consumers.ts`. Keep dependencies minimal; the PR lane
runs a subset and the release lane runs all of them, so install time is the main cost.

`react`/`react-dom` versions are injected by the script so one fixture can be run against several
peer versions without duplicating it.

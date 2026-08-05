# Publishing this package

[`@layerfi/components`](https://www.npmjs.com/package/@layerfi/components) is published from CI
only. There is no manual `npm publish` step, and there is no npm token to hold — the release
workflow authenticates to npm with OIDC trusted publishing.

> The published package is public and readable by anyone, whether or not they have credentials for
> the Layer service. Nothing secret may end up in `dist/`.

## The release flow

Three workflows, in order. The first and last are manual buttons; the middle one is a hook.

### 1. Release — Prepare (`release-prepare.yml`, manual)

Inputs: `release_type` (`alpha` | `stable`) and `increment` (`patch` | `minor` | `major`).

Computes the next version, pushes a `release/vX.Y.Z` branch, and opens a `chore(release): vX.Y.Z`
PR that bumps `package.json`. It does not merge, tag, publish, or touch Linear. Review and merge
that PR like any other.

Versioning is "model A": the cycle target is fixed at the first alpha, and stable drops the suffix.

| starting from | `release_type` | result |
|---|---|---|
| `0.1.143` (stable) | `alpha`, patch | `0.1.144-alpha.0` |
| `0.1.144-alpha.0` | `alpha` | `0.1.144-alpha.1` (`increment` ignored) |
| `0.1.144-alpha.1` | `stable` | `0.1.144` (`increment` ignored) |
| `0.1.143` (stable) | `stable`, minor | `0.2.0` |

### 2. Release — Tag (`release-tag.yml`, automatic)

Fires when a `release/v*` PR is merged. Creates the `vX.Y.Z` tag and a GitHub Release with generated
notes. Alphas are marked prerelease and are not made "latest". Nothing else tags; don't tag by hand.

### 3. Release — Publish (`release-publish.yml`, manual)

Inputs: `next_linear_release` (stable only) and `dry_run`, **which defaults to `true`**.

Reads the version from `package.json` on `main`, checks out the matching tag, verifies the packed
tarball, publishes, then updates Linear:

- **alpha** → `npm publish --tag alpha`, and syncs the Linear release
- **stable** → `npm publish` (dist-tag `latest`), syncs and completes the Linear release, queues the
  next one, and refreshes the screenshots in `Layer-Fi/api-documentation`

Because `dry_run` defaults to true, the first click is always a rehearsal: `npm publish --dry-run`,
Linear read-only, and the tag isn't required. Untick it to ship.

## What gates a publish

Before `npm publish` runs, the job packs the tarball and installs it into the consumer fixtures under
`consumer-fixtures/` — Vite/ESM, CJS `require`, and SSR. This runs in the publish job against the
exact tree being published, not as a separate job against `main`, so the tarball that gets verified
is the one that ships. See [docs/dependency-policy.md](docs/dependency-policy.md) for the full list
of gates and what each one covers.

`prepack` (`npm run typecheck && npm run build:clean`) rebuilds `dist/` on any `npm pack` or
`npm publish`, so a stale or half-built `dist/` cannot be published.

Only the `files` field decides what ships — currently `dist/` only. There is no `.npmignore`.

## Supply-chain posture

- **No npm token.** Auth is OIDC trusted publishing, configured for the package on npmjs.com.
  `release-publish.yml` needs `id-token: write` and deliberately omits `registry-url` on
  `setup-node`, which would otherwise write an empty `_authToken` and make npm skip OIDC.
- **npm is pinned** to 11.5.1 in the workflow; trusted publishing needs ≥ 11.5.1.
- **Provenance** is published (`--provenance`), so consumers can verify which repo, workflow, and
  commit built the tarball.
- **Actions are pinned to commit SHAs**, with the version in a trailing comment. The
  `github-actions` Dependabot lane moves them. Never reintroduce a floating tag like `@v4` — a tag
  is a pointer the action's author can move, and these workflows hold secrets and write tokens.
- **`.github/CODEOWNERS`** covers the workflows and the files that define the published surface.

## Local development against a consumer app

`npm link` works, but it makes React resolve twice, so it needs the extra step below. Packing the
tarball is closer to what a consumer actually gets:

```bash
npm pack                     # runs prepack: typecheck + clean build
cd ../your-app
npm install ../layer-react/layerfi-components-<version>.tgz
```

For an iterative loop, `npm run dev` rebuilds `dist/` on change (JS and types in parallel). With
`npm link`, run `npm run clear:react` in this repo afterwards to drop the duplicate React copies:

```bash
cd ../your-app && npm link ../layer-react
cd ../layer-react && npm run clear:react && npm run dev
```

To check what a publish would contain without publishing:

```bash
npm pack --dry-run       # file list
npm run test:consumers   # packs, then builds real consumer apps against the tarball
npm run lint:package     # publint + attw on the packed result
```

## Version numbers

Once a version is published it can never be reused, even if unpublished. The `version` field is
bumped by Release — Prepare, not by hand.

`0.x` versions are pre-1.0, so breaking changes can land in a minor — but the peer range in
`package.json` is a promise, and widening or narrowing it needs the consumer fixtures run across the
range first.

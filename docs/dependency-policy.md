# Dependency policy

How we decide whether a dependency alert matters, and how fast it has to be fixed.

`@layerfi/components` is a published library, so its dependencies are not all equally our problem.
A vulnerable Storybook plugin and a vulnerable runtime dependency reach very different places. The
point of this document is to stop treating them the same, in either direction.

The target is **not** zero outdated packages. It is:

- zero known-exploitable vulnerabilities in code we ship to consumers
- peer-version coverage that matches what we claim to support
- bounded upgrade lag
- reproducible, reviewable releases

## Exposure classes

| class | what it is | consumer risk | policy |
|---|---|---|---|
| `dependencies` | shipped to consumers; installed by every app that installs us | **high** | urgent for exploitable vulnerabilities; upgrade with the consumer fixtures green |
| bundled/inlined code | anything the build inlines into `dist/` rather than externalizing (see `bundleForCjs` in `vite/utils.ts`) | **high** | same as `dependencies` |
| `peerDependencies` | `react`, `react-dom` — resolved by the consumer, not us | compatibility | test the supported range; do not chase latest |
| `devDependencies` | build, lint, and test tooling | maintainer/CI only | patch vulnerabilities in the normal maintenance window; never emergency-release the library for one |
| release/publishing tooling | GitHub Actions in the release workflows, npm itself | **supply chain** | high priority even though consumers never install it — a compromise here ships arbitrary code to everyone |

Two consequences worth stating plainly:

- **`npm audit`'s headline number does not describe consumer exposure.** It covers dev and runtime
  dependencies, and does not cover peer dependencies at all. This is why
  `.github/workflows/npm-audit.yml` runs the audit twice — once over the full tree, once with
  `--omit=dev` — and reports the two sets separately. At the time of writing that split was 4
  consumer-facing versus 17 dev/CI-only, from an undifferentiated count of 21.
- **`overrides` protects our lockfile, not our consumers.** The existing
  `overrides.react-intl.typescript` entry pins what *we* resolve. It does not change transitive
  resolution for anyone installing the published package. A real consumer-facing fix needs the
  direct dependency upgraded, our implementation changed, or the published constraint adjusted.

## Triaging an alert

Answer these before deciding anything:

1. **Is the affected code in the published tarball?** `npm pack --dry-run` or the file list printed
   by `npm run test:consumers`. If it isn't, this is at most a CI-hygiene item.
2. **Is the vulnerable function reachable from our usage?** A ReDoS in a CLI argument parser that we
   never invoke is not the same as one in a code path a consumer's render hits.
3. **Where would exploitation happen?** In a consumer's browser, during their SSR/build, or only in
   our CI? This decides the class in the table above more reliably than the package name does.
4. **Is there a patched version inside our supported range?** For anything touching `react`, the
   patch has to work across the whole declared peer range, not just the newest.
5. **Does the fix need a release, or only a lockfile update?** A `devDependencies` bump needs no
   release. A `dependencies` bump does.

## Response times

| situation | response |
|---|---|
| exploitable critical/high in a runtime dependency | patch immediately, patch release |
| vulnerability in publishing or CI tooling | within a few days |
| non-exploitable vulnerability in a dev dependency | next weekly maintenance window |
| patch/minor updates | weekly grouped Dependabot PRs |
| majors | monthly review, manually |
| dependency is unmaintained | planned migration with an explicit deadline |

## Dismissals expire

A dismissed Dependabot alert must carry a reason **and a date**:

> Not exploitable — the vulnerable CLI path is never shipped; reconsider by 2026-11-01.

Record it as a comment on the alert. A dismissal with no expiry is indistinguishable from having
never looked, and outlives whoever understood the reasoning.

## Update lanes

Configured in `.github/dependabot.yml`. Security updates are opened immediately and are never
grouped with unrelated upgrades. Version updates are grouped by ecosystem — `storybook`, `linting`,
`testing`, then a catch-all `dev-tooling` — so a red PR points at one thing.

Runtime **patches** are grouped; runtime **minors** are deliberately not, because a
`react-aria-components` or `recharts` bump deserves its own review. Majors are excluded from the
weekly lane (they would permanently occupy the PR limit) and come from the monthly review instead.

Grouping heuristic: group things that fail together. ESLint and its plugins, yes. React, the CSS
engine, TypeScript, and the test runner in one PR produces a result — pass or fail — that nobody can
interpret.

## What a green PR actually proves

Ordinary checks read from the repo, so they cannot see a broken *published* package. These can:

| check | what it covers |
|---|---|
| `npm run test:consumers` | installs the packed tarball into Vite/ESM, CJS-require, and SSR fixtures and builds them |
| `npm run lint:package` | `publint` + `attw` — manifest correctness and whether declarations resolve under every module mode |
| `src/index.test.ts` | public export names, snapshotted |
| `src/index.test-d.ts` | consumer-facing types, including usage that must *not* compile |
| `npm run stories:check-a11y` | WCAG 2.1 A/AA against `public-api` stories, against a burn-down allowlist |
| `npm run size` | brotli budgets per entrypoint, including the cost of importing a single component |
| Chromatic | visual regressions — most valuable on CSS, icon, and component-foundation upgrades |

Visual regression coverage does not require every pixel to be frozen. It requires an unexpected diff
to get a human's attention.

## Reducing what consumers inherit

The safest dependency is one consumers never install.

- host frameworks stay in `peerDependencies`
- build and test tooling stays in `devDependencies`
- prefer a small local implementation over a trivial runtime dependency
- avoid broad utility packages where importing one function drags in a large tree
- don't bundle third-party code unintentionally — `files` plus the tarball assertions in
  `scripts/pack-and-test-consumers.ts` are what keep this honest
- keep peer ranges as wide as the tests justify rather than forcing consumers to upgrade

### On `sideEffects`

publint suggests adding it. We deliberately have not, and this is the reasoning so it isn't
re-litigated from the suggestion alone:

- the ESM output is a **single bundled module**, so there are no cross-module imports for
  `sideEffects` to let a bundler prune
- measured directly with `size-limit`: adding `"sideEffects": ["**/*.css", "**/*.scss"]` produced a
  **byte-identical** single-component import size
- the naive form, `"sideEffects": false`, is an active footgun — it would license a consumer's
  bundler to drop `import '@layerfi/components/index.css'` entirely

Revisit if the build ever emits per-component chunks instead of one bundle.

## Release security

Dependency hygiene is one half; the other is that only our CI can publish.

- publish only from the protected `release-publish.yml` workflow
- npm auth is OIDC trusted publishing — no long-lived token
- provenance is generated so consumers can verify where the package was built
- GitHub Actions are pinned to commit SHAs, with the `github-actions` Dependabot lane to move them
- keep lifecycle scripts minimal
- the tarball is verified in the consumer fixtures immediately before publish

See [PUBLISHING.md](../PUBLISHING.md) for the release flow itself.

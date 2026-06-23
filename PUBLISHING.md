# Publishing This Module

The @layerfi/components module is [available on
NPM](https://www.npmjs.com/package/@layerfi/components).

NOTE: This module is available to and accessible by anyone in the world, even if
they do not have the credentials to access the LayerFi service itself. Please
make sure no access tokens or keys get put into it accidentally.

## Development

Developing on this module is possible via `npm link`. This assumes that the
demonstration app `demo` and the module `components` live in the same directory.

# Do not add the module to package.json of `demo`.
# `cd ../demo`
# `npm link ../components`
# `cd ../components`
# `npm install`
# `rm -rf node_modules/react node_modules/react-dom`
# `npm run build`
# `cd ../demo`
# Stop the server if it's currently running.
# `npm install`
# `npm start`

When making changes that you want to see appear in the app, you should only need
to run `npm run build`. You may need to refresh the browser page if the change
was more than just a little styling.

Making changes to the dependencies of the module requires that it be installed.
Start at Step 4 above (`cd ../components`).

## Production

The module is published with `npm publish`.

In order to see what will happen before publishing, use `npm publish --dry-run`.
This will show what the command will do, but will not actually publish the
module. You can use this output to check for oversights before publishing.
Similarly, you can run `npm pack` to build a local tarball of the package.

Running `npm publish`/`npm pack` in the module will put everything that is in
the directory into the module _except_ the files disallowed by `.npmignore`. All
that is necessary are the files in `dist` after being generated with `npm run
build`. Therefore, you must run `npm run build` before packing/publishing.
However, this should run automatically via the `prepack` script.

### Version Numbers

The version number must be incremented in order to be put on NPM. That is,
version numbers refer to a specific and unique set of code. Once a version
number is taken, it cannot be reused, even if that version is "unpublished".

In Semantic Versioning, the version numbers mean things: the version is split
into `Major.Minor.Patch` numbers. From [semver.org](https://semver.org/):

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
> * MAJOR version when you make incompatible API changes
> * MINOR version when you add functionality in a backward compatible manner
> * PATCH version when you make backward compatible bug fixes
>
> Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

Versions with a Major version of 0 are allowed to basically do whatever they
want, as that is considered "prerelease".

NOTE: The `version` field of package.json must be incremented in at least one of these
numbers in order to publish a new version.

## Linear Release Sync

Releases are tracked in Linear via a continuous pipeline. Two complementary GitHub workflows
keep a release's scope — and therefore its changelog — complete:

- **`linear-release.yml`** (push to `main`): runs `linear/linear-release-action sync`, which
  scans the merge commits and asks Linear to resolve each PR number back to its linked issues,
  attaching them to the in-progress release.
- **`linear-pr-sync.yml`** (PR merged to `main`): runs `scripts/linear/sync-pr-to-linear.mjs`.
  It guarantees every merged PR is *linked to a Linear issue* — creating one in **Done** if the
  PR referenced none — so the sync above can pull it into scope. A PR with no Linear issue would
  otherwise be invisible to the release.

How `linear-pr-sync` decides:

1. If an issue is already linked to the PR URL (`attachmentsForURL`), or the PR
   title/branch/body names a real `ABC-123`, the PR is left mapped to that issue — only the PR
   attachment is ensured. Human-created links are respected, not relabeled.
2. Otherwise it looks at the **issues already in the in-progress release** and asks Claude
   (Haiku) whether this PR is part of the same change as one of them:
   - **Yes** → the PR is attached to that issue, so related PRs (e.g. several commits in an
     ongoing "API hardening" effort) collapse to **one release-notes line**.
   - **No / uncertain** → a new issue is created in Done, labeled from the PR title prefix
     (`fix:`→Bug, `feat:`→Feature, `refactor:`/`chore:`/`ci:`/…→Improvement, `i18n:`→i18n,
     `docs:`→Docs, else Uncategorized). The classifier biases toward "new" — a spare issue is
     cheap to merge in Linear, a wrong grouping corrupts the notes.

Either way the PR is attached and the issue id is commented back on the PR. The candidate set
is just whatever is already in the release — no theme config to maintain; groupings emerge.

### Required configuration

- Secret **`LINEAR_API_KEY`** — a Linear personal API key (GraphQL). This is *separate* from
  `LINEAR_ACCESS_KEY` (the release-action pipeline key, which cannot run arbitrary GraphQL). To
  attribute auto-created issues to a bot instead of a person, swap in a Linear OAuth access
  token (the script auto-detects `lin_oauth_*` and sends it as a Bearer token).
- Secret **`ANTHROPIC_API_KEY`** — for the add-vs-create classifier (Claude Haiku; ~half a cent
  per PR with no explicit link).
- Variable **`LINEAR_TEAM_KEY`** — the team key (e.g. `ENG`) that owns auto-created issues.

Set `LINEAR_DRY_RUN=1` to skip Linear writes (the read-only release query and the classifier
still run, and the intended mutations are logged).

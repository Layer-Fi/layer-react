/**
 * Shared by `.storybook/main.ts` and `scripts/check-docs-screenshots.ts`.
 *
 * Stories can't import these: Storybook's CSF indexer parses `tags` statically and rejects
 * anything but a string literal. `screenshots:check` compares the literals against the
 * manifest, so a typo still fails CI.
 */

/** Component is exported from `src/index.tsx`. Set on the meta. What GitHub Pages ships. */
export const PUBLIC_API_TAG = 'public-api'

/** Story backs an image in Layer-Fi/api-documentation. Must appear in the docs manifest. */
export const DOCS_SCREENSHOT_TAG = 'docs-screenshot'

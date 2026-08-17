/**
 * Shared by `.storybook/main.ts` and `scripts/check-docs-screenshots.ts`.
 *
 * Stories can't import these: Storybook's CSF indexer parses `tags` statically and rejects
 * anything but a string literal. `screenshots:check` compares the literals against the
 * manifest, so a typo still fails CI.
 */

/** Story ships to GitHub Pages. Opted into per story, never on the meta. */
export const PUBLIC_API_TAG = 'public-api'

/** Story backs an image in Layer-Fi/api-documentation. Must appear in the docs manifest. */
export const DOCS_SCREENSHOT_TAG = 'docs-screenshot'

/** Story renders a state a real backend produces on its own. Opted into per story. */
export const REAL_BACKEND_TAG = 'real-backend'

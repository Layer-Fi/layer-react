import { join } from 'node:path'
import { type StorybookConfig } from '@storybook/react-vite'
import { type Alias, type AliasOptions } from 'vite'

import { PUBLIC_API_TAG } from './tags'

// Plaid's hosted iframe can't run in Storybook; the mock fakes a successful link.
// Calendly is NOT mocked: stories point CTAs at Calendly's public demo page
// (calendly.com/calendly-demo), which renders the real widget.
const PLAID_LINK_ALIAS = {
  find: 'react-plaid-link',
  replacement: join(process.cwd(), '.storybook/mocks/react-plaid-link.ts'),
}

const withPlaidLinkAlias = (alias: AliasOptions | undefined): AliasOptions =>
  Array.isArray(alias)
    ? [...(alias as readonly Alias[]), PLAID_LINK_ALIAS]
    : { ...alias, [PLAID_LINK_ALIAS.find]: PLAID_LINK_ALIAS.replacement }

// Two consumers want a subset of the library, so they narrow the index at build time via
// STORYBOOK_SCOPE. Doing it here rather than through Chromatic's --only-story-files matters:
// that flag is mutually exclusive with --only-changed (TurboSnap), and we want both.
//
//   public    — components exported from src/index.tsx, tagged `public-api` on the meta.
//               What the GitHub Pages deploy ships. Distinct from `docs-screenshot`, the
//               narrower set backing images on docs.layerfi.com; a story can carry both.
//   chromatic — the design system plus agent scratch stories. Features and views compose
//               these primitives, so a regression generally surfaces here first.
const SCOPE = process.env.STORYBOOK_SCOPE
const CHROMATIC_PATHS = /\/src\/components\/(ui|blocks)\/|scratch\.stories\./

const inScope = (fileName: string, tags: string[] | undefined) => {
  if (SCOPE === 'public') return tags?.includes(PUBLIC_API_TAG) ?? false
  if (SCOPE === 'chromatic') return CHROMATIC_PATHS.test(fileName)
  return true
}

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  staticDirs: ['./public'],
  experimental_indexers: (existing = []) => existing.map(indexer => ({
    ...indexer,
    createIndex: async (fileName, options) => {
      const entries = await indexer.createIndex(fileName, options)
      return entries.filter(({ tags }) => inScope(fileName, tags))
    },
  })),
  viteFinal: viteConfig => ({
    ...viteConfig,
    base: process.env.STORYBOOK_BASE_PATH ?? viteConfig.base,
    build: {
      ...viteConfig.build,
      // vite.config.ts targets es2016 for consumers, but Storybook bundles dependencies the
      // library leaves external — @formatjs/intl-durationformat ships BigInt literals, which
      // cannot be lowered that far. Storybook only ever runs in a modern browser.
      target: 'es2020',
    },
    resolve: {
      ...viteConfig.resolve,
      tsconfigPaths: true,
      alias: withPlaidLinkAlias(viteConfig.resolve?.alias),
    },
  }),
}

export default config

import { join } from 'node:path'
import { type StorybookConfig } from '@storybook/react-vite'
import { type Alias, type AliasOptions } from 'vite'

import { PUBLIC_API_TAG, REAL_BACKEND_TAG } from './tags'

// Plaid's hosted iframe can't run against MSW; the mock fakes a successful link.
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
//   public    — stories tagged `public-api`, the shipped surface of components exported from
//               src/index.tsx. What the GitHub Pages deploy ships. Distinct from
//               `docs-screenshot`, the narrower set backing images on docs.layerfi.com; a
//               story can carry both.
//   chromatic — the design system plus agent scratch stories. Features and views compose
//               these primitives, so a regression generally surfaces here first.
//   real      — stories tagged `real-backend`, the ones that still mean something with MSW off.
//               What the access-protected Vercel preview ships.
const USES_REAL_BACKEND = process.env.STORYBOOK_LAYER_BACKEND === 'real'

const SCOPE = process.env.STORYBOOK_SCOPE
const CHROMATIC_PATHS = /\/src\/components\/(ui|blocks)\/|scratch\.stories\./

const inScope = (fileName: string, tags: string[] | undefined) => {
  if (SCOPE === 'public') return tags?.includes(PUBLIC_API_TAG) ?? false
  if (SCOPE === 'real') return tags?.includes(REAL_BACKEND_TAG) ?? false
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
    resolve: {
      ...viteConfig.resolve,
      tsconfigPaths: true,
      alias: USES_REAL_BACKEND ? viteConfig.resolve?.alias : withPlaidLinkAlias(viteConfig.resolve?.alias),
    },
    // `vercel dev` serves `/api` on its own port (3000 by default); the dev server proxies to it
    // so the relative STORYBOOK_LAYER_TOKEN_ENDPOINT resolves instead of 404ing against :6006.
    server: {
      ...viteConfig.server,
      proxy: {
        ...viteConfig.server?.proxy,
        '/api': { target: process.env.STORYBOOK_VERCEL_DEV_URL ?? 'http://localhost:3000' },
      },
    },
  }),
}

export default config

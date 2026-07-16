import { join } from 'node:path'
import { type StorybookConfig } from '@storybook/react-vite'
import { type Alias, type AliasOptions } from 'vite'

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

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  staticDirs: ['./public'],
  viteFinal: viteConfig => ({
    ...viteConfig,
    base: process.env.STORYBOOK_BASE_PATH ?? viteConfig.base,
    resolve: {
      ...viteConfig.resolve,
      tsconfigPaths: true,
      alias: withPlaidLinkAlias(viteConfig.resolve?.alias),
    },
  }),
}

export default config

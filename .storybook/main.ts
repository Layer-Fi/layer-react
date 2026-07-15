import { join } from 'node:path'
import { type StorybookConfig } from '@storybook/react-vite'
import { type Alias, type AliasOptions } from 'vite'

// Hosted iframes (Plaid, Calendly) can't run in Storybook; these mocks fake the widgets.
const IFRAME_MODULE_ALIASES = [
  { find: 'react-plaid-link', replacement: join(process.cwd(), '.storybook/mocks/react-plaid-link.ts') },
  { find: 'react-calendly', replacement: join(process.cwd(), '.storybook/mocks/react-calendly.tsx') },
]

const withIframeModuleAliases = (alias: AliasOptions | undefined): AliasOptions =>
  Array.isArray(alias)
    ? [...(alias as readonly Alias[]), ...IFRAME_MODULE_ALIASES]
    : { ...alias, ...Object.fromEntries(IFRAME_MODULE_ALIASES.map(a => [a.find, a.replacement])) }

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
      alias: withIframeModuleAliases(viteConfig.resolve?.alias),
    },
  }),
}

export default config

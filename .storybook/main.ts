import { join } from 'node:path'

import { type StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  staticDirs: ['./public'],
  viteFinal: viteConfig => ({
    ...viteConfig,
    resolve: {
      ...viteConfig.resolve,
      tsconfigPaths: true,
      alias: {
        ...viteConfig.resolve?.alias,
        // Plaid's hosted iframe can't run in Storybook; swap the SDK for a mock
        // that fakes a successful link so the connect flow is demoable end-to-end.
        'react-plaid-link': join(process.cwd(), '.storybook/mocks/react-plaid-link.ts'),
      },
    },
  }),
}

export default config

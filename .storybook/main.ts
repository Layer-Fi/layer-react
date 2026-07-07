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
    },
  }),
}

export default config

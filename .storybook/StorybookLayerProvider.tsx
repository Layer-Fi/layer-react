import { type PropsWithChildren } from 'react'

import { type Environment, EnvironmentConfigs } from '../src/providers/Environment/environmentConfigs'
import { LayerProvider } from '../src/providers/LayerProvider/LayerProvider'
import { LayerTestProvider, TEST_LAYER_THEME } from '../src/test-utils/LayerTestProvider'

export const usesRealBackend = import.meta.env.STORYBOOK_LAYER_BACKEND === 'real'

const readRequiredEnv = (name: string, value: unknown) => {
  if (typeof value !== 'string' || !value) throw new Error(`Missing ${name}`)

  return value
}

const getEnvironment = (): Environment => {
  const value: unknown = import.meta.env.STORYBOOK_LAYER_ENVIRONMENT
  const environment = typeof value === 'string' && value ? value : 'sandbox'

  if (!(environment in EnvironmentConfigs)) {
    throw new Error(`Invalid STORYBOOK_LAYER_ENVIRONMENT: ${environment}`)
  }

  return environment as Environment
}

const getRealBackendProps = () => ({
  businessId: readRequiredEnv('STORYBOOK_LAYER_BUSINESS_ID', import.meta.env.STORYBOOK_LAYER_BUSINESS_ID),
  businessAccessToken: readRequiredEnv('STORYBOOK_LAYER_BUSINESS_ACCESS_TOKEN', import.meta.env.STORYBOOK_LAYER_BUSINESS_ACCESS_TOKEN),
  environment: getEnvironment(),
})

export const StorybookLayerProvider = ({ children }: PropsWithChildren) => {
  if (!usesRealBackend) return <LayerTestProvider>{children}</LayerTestProvider>

  return (
    <LayerProvider {...getRealBackendProps()} theme={TEST_LAYER_THEME}>
      {children}
    </LayerProvider>
  )
}

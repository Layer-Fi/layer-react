import { type PropsWithChildren } from 'react'

import { type EnvironmentConfigOverride } from '@providers/Environment/environmentConfigs'
import { LayerProvider } from '@providers/LayerProvider/LayerProvider'

export const TEST_LAYER_API_URL = 'https://api.test.layerfi.com'
export const TEST_LAYER_BUSINESS_ID = 'test-business-id'
export const TEST_LAYER_APP_ID = 'test-app-id'
export const TEST_LAYER_APP_SECRET = 'test-app-secret'

const TEST_LAYER_ENVIRONMENT_CONFIG: EnvironmentConfigOverride = {
  environment: 'production',
  apiUrl: TEST_LAYER_API_URL,
  authUrl: 'https://auth.test.layerfi.com/oauth2/token',
  scope: 'test',
}

export const LayerTestProvider = ({ children }: PropsWithChildren) => (
  <LayerProvider
    businessId={TEST_LAYER_BUSINESS_ID}
    appId={TEST_LAYER_APP_ID}
    appSecret={TEST_LAYER_APP_SECRET}
    environmentConfigOverride={TEST_LAYER_ENVIRONMENT_CONFIG}
  >
    {children}
  </LayerProvider>
)

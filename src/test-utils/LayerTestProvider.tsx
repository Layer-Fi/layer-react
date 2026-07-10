import { type PropsWithChildren } from 'react'

import { type LayerThemeConfig } from '@internal-types/layerContext'
import { type SupportedLocale } from '@utils/i18n/supportedLocale'
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

export const TEST_LAYER_ACCESS_TOKEN = 'test-access-token'

/**
 * Charts and themed surfaces read `--color-dark`/`--color-light` CSS variables
 * that only exist where a theme is set, so tests and stories get a default one.
 */
export const TEST_LAYER_THEME: LayerThemeConfig = {
  colors: {
    dark: { h: '218', s: '55%', l: '20%' },
    light: { h: '158', s: '35%', l: '75%' },
  },
}

type LayerTestProviderProps = PropsWithChildren<{
  locale?: SupportedLocale
  theme?: LayerThemeConfig
}>

export const LayerTestProvider = ({ children, locale, theme = TEST_LAYER_THEME }: LayerTestProviderProps) => (
  <LayerProvider
    businessId={TEST_LAYER_BUSINESS_ID}
    appId={TEST_LAYER_APP_ID}
    appSecret={TEST_LAYER_APP_SECRET}
    environmentConfigOverride={TEST_LAYER_ENVIRONMENT_CONFIG}
    locale={locale}
    theme={theme}
  >
    {children}
  </LayerProvider>
)

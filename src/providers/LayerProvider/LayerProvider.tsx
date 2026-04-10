import { type PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { SWRConfig } from 'swr'

import { type LayerThemeConfig } from '@internal-types/layerContext'
import { type LayerError } from '@utils/api/errorHandler'
import { DEFAULT_LOCALE, type SupportedLocale } from '@utils/i18n/supportedLocale'
import { DEFAULT_SWR_CONFIG } from '@utils/swr/defaultSWRConfig'
import { localeKeyMiddleware } from '@utils/swr/localeKeyMiddleware'
import { AuthInputProvider } from '@providers/AuthInputProvider'
import { BusinessProvider } from '@providers/BusinessProvider/BusinessProvider'
import type { Environment, EnvironmentConfigOverride } from '@providers/Environment/environmentConfigs'
import { EnvironmentInputProvider } from '@providers/Environment/EnvironmentInputProvider'
import { GlobalDateStoreProvider } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { LayerI18nProvider } from '@providers/I18nProvider/LayerI18nProvider'
import { StaleLocaleCacheInvalidator } from '@providers/I18nProvider/StaleLocaleCacheInvalidator'

export type EventCallbacks = {
  onTransactionCategorized?: () => void
  onTransactionsFetched?: () => void
}

type BaseLayerProviderProps = {
  businessId: string
  appId?: string
  appSecret?: string
  businessAccessToken?: string

  locale?: SupportedLocale
  theme?: LayerThemeConfig
  usePlaidSandbox?: boolean
  onError?: (error: LayerError) => void
  eventCallbacks?: EventCallbacks
}

type LayerProviderPropsWithLayerEnv = BaseLayerProviderProps & { environment?: Environment }
type LayerProviderPropsWithEnvironmentConfigOverride = BaseLayerProviderProps & { environmentConfigOverride?: EnvironmentConfigOverride }

export type LayerProviderProps = LayerProviderPropsWithLayerEnv | LayerProviderPropsWithEnvironmentConfigOverride

export const LayerProvider = ({
  appId,
  appSecret,
  businessAccessToken,
  locale = DEFAULT_LOCALE,
  usePlaidSandbox,
  ...restProps
}: PropsWithChildren<LayerProviderProps>) => {
  const [cache] = useState(() => new Map())
  const provider = useCallback(() => cache, [cache])
  const swrConfig = useMemo(
    () => ({ ...DEFAULT_SWR_CONFIG, use: [localeKeyMiddleware], provider }),
    [provider],
  )

  let environment: Environment | undefined
  let environmentConfigOverride: EnvironmentConfigOverride | undefined

  if ('environmentConfigOverride' in restProps) {
    environmentConfigOverride = restProps.environmentConfigOverride
  }
  else if ('environment' in restProps) {
    environment = restProps.environment
  }
  else {
    environment = 'production'
  }

  return (
    <SWRConfig value={swrConfig}>
      <LayerI18nProvider locale={locale}>
        <StaleLocaleCacheInvalidator />
        <EnvironmentInputProvider environment={environment} environmentConfigOverride={environmentConfigOverride} usePlaidSandbox={usePlaidSandbox}>
          <AuthInputProvider
            appId={appId}
            appSecret={appSecret}
            businessAccessToken={businessAccessToken}
          >
            <GlobalDateStoreProvider>
              <BusinessProvider {...restProps} />
            </GlobalDateStoreProvider>
          </AuthInputProvider>
        </EnvironmentInputProvider>
      </LayerI18nProvider>
    </SWRConfig>
  )
}

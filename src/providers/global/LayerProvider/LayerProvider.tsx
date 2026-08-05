import { type PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { SWRConfig } from 'swr'

import { type LayerThemeConfig } from '@internal-types/shared/layerContext'
import type { LayerEvent } from '@schemas/common/layerEvents'
import { type LayerError } from '@utils/shared/api/errorHandler'
import { DEFAULT_LOCALE, type SupportedLocale } from '@utils/shared/i18n/supportedLocale'
import { DEFAULT_SWR_CONFIG } from '@utils/shared/swr/defaultSWRConfig'
import { localeKeyMiddleware } from '@utils/shared/swr/localeKeyMiddleware'
import { AuthInputProvider } from '@providers/global/AuthInput/AuthInputProvider'
import type { Environment, EnvironmentConfigOverride } from '@providers/global/Environment/environmentConfigs'
import { EnvironmentInputProvider } from '@providers/global/Environment/EnvironmentInputProvider'
import { GlobalDateStoreProvider } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { LayerI18nProvider } from '@providers/global/I18nProvider/LayerI18nProvider'
import { StaleLocaleCacheInvalidator } from '@providers/global/LayerProvider/StaleLocaleCacheInvalidator'
import { BusinessProvider } from '@providers/features/business/BusinessProvider/BusinessProvider'

export type EventCallbacks = {
  onEvent?: (event: LayerEvent) => void
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

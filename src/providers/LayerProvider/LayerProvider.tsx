import { type PropsWithChildren, useState } from 'react'
import { SWRConfig } from 'swr'

import { type LayerThemeConfig } from '@internal-types/layerContext'
import { type LayerError } from '@utils/api/errorHandler'
import { DEFAULT_SWR_CONFIG } from '@utils/swr/defaultSWRConfig'
import { AuthInputProvider } from '@providers/AuthInputProvider'
import { BusinessProvider } from '@providers/BusinessProvider/BusinessProvider'
import type { Environment, EnvironmentConfigOverride } from '@providers/Environment/environmentConfigs'
import { EnvironmentInputProvider } from '@providers/Environment/EnvironmentInputProvider'
import { GlobalDateStoreProvider } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { LayerI18nProvider } from '@providers/I18nProvider/LayerI18nProvider'

export type EventCallbacks = {
  onTransactionCategorized?: () => void
  onTransactionsFetched?: () => void
}

type BaseLayerProviderProps = {
  businessId: string
  appId?: string
  appSecret?: string
  businessAccessToken?: string

  theme?: LayerThemeConfig
  usePlaidSandbox?: boolean
  plaidRedirectUri?: string
  plaidReceivedRedirectUri?: string
  onError?: (error: LayerError) => void
  eventCallbacks?: EventCallbacks
}

type LayerProviderPropsWithLayerEnv = BaseLayerProviderProps & { environment?: Environment }
type LayerProviderPropsWithEnvironmentConfigOverride = BaseLayerProviderProps & { environmentConfigOverride?: EnvironmentConfigOverride }

export type LayerProviderProps = LayerProviderPropsWithLayerEnv | LayerProviderPropsWithEnvironmentConfigOverride

export const LayerProvider = (props: PropsWithChildren<LayerProviderProps>) => {
  const [cache] = useState(() => new Map())

  const {
    appId,
    appSecret,
    businessAccessToken,
    usePlaidSandbox,
    plaidRedirectUri,
    plaidReceivedRedirectUri,
    ...restProps
  } = props

  let environment: Environment | undefined
  let environmentConfigOverride: EnvironmentConfigOverride | undefined

  if ('environmentConfigOverride' in props) {
    environmentConfigOverride = props.environmentConfigOverride
  }
  else if ('environment' in props) {
    environment = props.environment
  }
  else {
    environment = 'production'
  }

  return (
    <SWRConfig value={{ ...DEFAULT_SWR_CONFIG, provider: () => cache }}>
      <LayerI18nProvider>
        <EnvironmentInputProvider
          environment={environment}
          environmentConfigOverride={environmentConfigOverride}
          usePlaidSandbox={usePlaidSandbox}
          plaidRedirectUri={plaidRedirectUri}
          plaidReceivedRedirectUri={plaidReceivedRedirectUri}
        >
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

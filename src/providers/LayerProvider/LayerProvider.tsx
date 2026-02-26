import { type PropsWithChildren, useState } from 'react'
import { I18nProvider } from 'react-aria-components'
import { SWRConfig } from 'swr'

import { type LayerThemeConfig } from '@internal-types/layer_context'
import { type LayerError } from '@models/ErrorHandler'
import { DEFAULT_SWR_CONFIG } from '@utils/swr/defaultSWRConfig'
import { AuthInputProvider } from '@providers/AuthInputProvider'
import { BusinessProvider } from '@providers/BusinessProvider/BusinessProvider'
import type { Environment, EnvironmentConfigOverride } from '@providers/Environment/environmentConfigs'
import { EnvironmentInputProvider } from '@providers/Environment/EnvironmentInputProvider'
import { GlobalDateStoreProvider } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

export type EventCallbacks = {
  onTransactionCategorized?: () => void
  onTransactionsFetched?: () => void
}

export type LayerProviderProps = {
  businessId: string
  appId?: string
  appSecret?: string
  businessAccessToken?: string
  environment?: Environment
  environmentConfigOverride?: EnvironmentConfigOverride
  theme?: LayerThemeConfig
  usePlaidSandbox?: boolean
  onError?: (error: LayerError) => void
  eventCallbacks?: EventCallbacks
}

export const LayerProvider = ({
  appId,
  appSecret,
  businessAccessToken,
  environmentConfigOverride,
  environment,
  usePlaidSandbox,
  ...restProps
}: PropsWithChildren<LayerProviderProps>) => {
  const [cache] = useState(() => new Map())

  return (
    <SWRConfig value={{ ...DEFAULT_SWR_CONFIG, provider: () => cache }}>
      <I18nProvider locale='en-US'>
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
      </I18nProvider>
    </SWRConfig>
  )
}

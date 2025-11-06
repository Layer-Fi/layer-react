import { PropsWithChildren, useState } from 'react'
import { LayerError } from '@models/ErrorHandler'
import { BusinessProvider } from '@providers/BusinessProvider/BusinessProvider'
import { LayerThemeConfig } from '@internal-types/layer_context'
import { SWRConfig } from 'swr'
import type { Environment } from '@providers/Environment/environmentConfigs'
import { AuthInputProvider } from '@providers/AuthInputProvider'
import { EnvironmentInputProvider } from '@providers/Environment/EnvironmentInputProvider'
import { DEFAULT_SWR_CONFIG } from '@utils/swr/defaultSWRConfig'
import { GlobalDateStoreProvider } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

export type EventCallbacks = {
  onTransactionCategorized?: (bankTransactionId: string) => void
  onTransactionsFetched?: () => void
}

export type LayerProviderProps = {
  businessId: string
  appId?: string
  appSecret?: string
  businessAccessToken?: string
  environment?: Environment
  theme?: LayerThemeConfig
  usePlaidSandbox?: boolean
  onError?: (error: LayerError) => void
  eventCallbacks?: EventCallbacks
}

export const LayerProvider = ({
  appId,
  appSecret,
  businessAccessToken,
  environment,
  usePlaidSandbox,
  ...restProps
}: PropsWithChildren<LayerProviderProps>) => {
  const [cache] = useState(() => new Map())

  return (
    <SWRConfig value={{ ...DEFAULT_SWR_CONFIG, provider: () => cache }}>
      <EnvironmentInputProvider environment={environment} usePlaidSandbox={usePlaidSandbox}>
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
    </SWRConfig>
  )
}

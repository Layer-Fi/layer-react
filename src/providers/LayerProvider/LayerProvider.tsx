import React, { PropsWithChildren } from 'react'
import { LayerError } from '../../models/ErrorHandler'
import { BusinessProvider } from '../../providers/BusinessProvider/BusinessProvider'
import { LayerThemeConfig } from '../../types/layer_context'
import { SWRConfig, SWRConfiguration } from 'swr'
import type { Environment } from '../Environment/environmentConfigs'
import { AuthInputProvider } from '../AuthInputProvider'
import { EnvironmentInputProvider } from '../Environment/EnvironmentInputProvider'
import { BusinessInputProvider } from '../BusinessProvider/BusinessInputProvider'

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
  businessId,
  businessAccessToken,
  environment,
  usePlaidSandbox,
  ...restProps
}: PropsWithChildren<LayerProviderProps>) => {
  const defaultSWRConfig: SWRConfiguration = {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  }

  return (
    <SWRConfig value={{ ...defaultSWRConfig, provider: () => new Map() }}>
      <EnvironmentInputProvider environment={environment} usePlaidSandbox={usePlaidSandbox}>
        <AuthInputProvider
          appId={appId}
          appSecret={appSecret}
          businessAccessToken={businessAccessToken}
        >
          <BusinessInputProvider businessId={businessId}>
            <BusinessProvider {...restProps} />
          </BusinessInputProvider>
        </AuthInputProvider>
      </EnvironmentInputProvider>
    </SWRConfig>
  )
}

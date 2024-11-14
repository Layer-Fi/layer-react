import React, { PropsWithChildren } from 'react'
import { LayerError } from '../../models/ErrorHandler'
import { BusinessProvider } from '../../providers/BusinessProvider/BusinessProvider'
import { LayerThemeConfig } from '../../types/layer_context'
import { SWRConfig, SWRConfiguration } from 'swr'
import type { Environment } from './environment'
import { AuthInputProvider } from '../AuthInputProvider'

export type EventCallbacks = {
  onTransactionCategorized?: (bankTransactionId: string) => void
  onTransactionsFetched?: () => void
}

export type Props = {
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
  ...restProps
}: PropsWithChildren<Props>) => {
  const defaultSWRConfig: SWRConfiguration = {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  }

  return (
    <SWRConfig value={{ ...defaultSWRConfig, provider: () => new Map() }}>
      <AuthInputProvider
        appId={appId}
        appSecret={appSecret}
        businessAccessToken={businessAccessToken}
        environment={environment}
      >
        <BusinessProvider {...restProps} environment={environment} />
      </AuthInputProvider>
    </SWRConfig>
  )
}

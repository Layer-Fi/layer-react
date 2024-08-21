import React, { PropsWithChildren } from 'react'
import { LayerError } from '../../models/ErrorHandler'
import { BusinessProvider } from '../../providers/BusinessProvider/BusinessProvider'
import { LayerThemeConfig } from '../../types/layer_context'
import { SWRConfig, SWRConfiguration } from 'swr'

type LayerEnvironmentConfig = {
  url: string
  scope: string
  apiUrl: string
}

export const LayerEnvironment: Record<string, LayerEnvironmentConfig> = {
  production: {
    url: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://api.layerfi.com/production',
    apiUrl: 'https://api.layerfi.com',
  },
  sandbox: {
    url: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    apiUrl: 'https://sandbox.layerfi.com',
  },
  staging: {
    url: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    apiUrl: 'https://sandbox.layerfi.com',
  },
  internalStaging: {
    url: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    apiUrl: 'https://staging.layerfi.com',
  },
}

export type EventCallbacks = {
  onTransactionCategorized?: (bankTransactionId: string) => void
}

export type Props = {
  businessId: string
  appId?: string
  appSecret?: string
  businessAccessToken?: string
  environment?: keyof typeof LayerEnvironment
  theme?: LayerThemeConfig
  usePlaidSandbox?: boolean
  onError?: (error: LayerError) => void
  eventCallbacks?: EventCallbacks
}

export const LayerProvider = (props: PropsWithChildren<Props>) => {
  const defaultSWRConfig: SWRConfiguration = {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  }

  return (
    <SWRConfig value={{ ...defaultSWRConfig, provider: () => new Map() }}>
      <BusinessProvider {...props} />
    </SWRConfig>
  )
}

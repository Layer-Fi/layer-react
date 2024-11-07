import React, { PropsWithChildren } from 'react'
import { LayerError } from '../../models/ErrorHandler'
import { BusinessProvider } from '../../providers/BusinessProvider/BusinessProvider'
import { LayerThemeConfig } from '../../types/layer_context'
import { SWRConfig } from 'swr'
import { DEFAULT_SWR_CONFIG } from '../../utils/swr/defaultSWRConfig'

type LayerEnvironmentConfig = {
  url: string
  scope: string
  apiUrl: string
  usePlaidSandbox: boolean
}

export const LayerEnvironment: Record<string, LayerEnvironmentConfig> = {
  production: {
    url: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://api.layerfi.com/production',
    apiUrl: 'https://api.layerfi.com',
    usePlaidSandbox: false,
  },
  sandbox: {
    url: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    apiUrl: 'https://sandbox.layerfi.com',
    usePlaidSandbox: true,
  },
  staging: {
    url: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    apiUrl: 'https://staging.layerfi.com',
    usePlaidSandbox: true,
  },
  internalStaging: {
    url: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    apiUrl: 'https://staging.layerfi.com',
    usePlaidSandbox: true,
  },
}

export type EventCallbacks = {
  onTransactionCategorized?: (bankTransactionId: string) => void
  onTransactionsFetched?: () => void
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
  return (
    <SWRConfig value={{ ...DEFAULT_SWR_CONFIG, provider: () => new Map() }}>
      <BusinessProvider {...props} />
    </SWRConfig>
  )
}

import React, { PropsWithChildren } from 'react'
import { LayerError } from '../../models/ErrorHandler'
import { BusinessProvider } from '../../providers/BusinessProvider/BusinessProvider'
import { LayerThemeConfig } from '../../types/layer_context'
<<<<<<< HEAD
import { SWRConfig, SWRConfiguration } from 'swr'
import type { Environment } from '../Environment/environmentConfigs'
import { AuthInputProvider } from '../AuthInputProvider'
import { EnvironmentInputProvider } from '../Environment/EnvironmentInputProvider'
=======
import { SWRConfig } from 'swr'
import type { Environment } from './environment'
import { DEFAULT_SWR_CONFIG } from '../../utils/swr/defaultSWRConfig'
>>>>>>> 041ced2 (feat: confirm accounts modal)

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

<<<<<<< HEAD
export const LayerProvider = ({
  appId,
  appSecret,
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
          <BusinessProvider {...restProps} />
        </AuthInputProvider>
      </EnvironmentInputProvider>
=======
export const LayerProvider = (props: PropsWithChildren<Props>) => {
  return (
    <SWRConfig value={{ ...DEFAULT_SWR_CONFIG, provider: () => new Map() }}>
      <BusinessProvider {...props} />
>>>>>>> 041ced2 (feat: confirm accounts modal)
    </SWRConfig>
  )
}

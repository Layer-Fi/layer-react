import { type PropsWithChildren, useState } from 'react'
import { I18nProvider } from 'react-aria-components'
import { SWRConfig } from 'swr'

import { type LayerThemeConfig } from '@internal-types/layer_context'
import { type LayerError } from '@models/ErrorHandler'
import { DEFAULT_SWR_CONFIG } from '@utils/swr/defaultSWRConfig'
import { AuthInputProvider } from '@providers/AuthInputProvider'
import { BusinessProvider } from '@providers/BusinessProvider/BusinessProvider'
import type { Environment } from '@providers/Environment/environmentConfigs'
import { EnvironmentInputProvider } from '@providers/Environment/EnvironmentInputProvider'
import { GlobalDateStoreProvider } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { IntlProvider } from '@providers/IntlProvider/IntlProvider'
import type { IntlSettingsInput, I18nResources } from '@i18n/types'

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
  theme?: LayerThemeConfig
  usePlaidSandbox?: boolean
  onError?: (error: LayerError) => void
  eventCallbacks?: EventCallbacks
  locale?: IntlSettingsInput
  resources?: I18nResources
}

export const LayerProvider = ({
  appId,
  appSecret,
  businessAccessToken,
  environment,
  usePlaidSandbox,
  locale,
  resources,
  ...restProps
}: PropsWithChildren<LayerProviderProps>) => {
  const [cache] = useState(() => new Map())

  return (
    <SWRConfig value={{ ...DEFAULT_SWR_CONFIG, provider: () => cache }}>
      <IntlProvider locale={locale} resources={resources}>
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
      </IntlProvider>
    </SWRConfig>
  )
}

import { type EventCallbacks, type LayerThemeConfig } from '@internal-types/shared/layerContext'
import { type LayerError } from '@utils/shared/api/errorHandler'
import { type SupportedLocale } from '@utils/shared/i18n/supportedLocale'
import type { Environment, EnvironmentConfigOverride } from '@providers/global/Environment/environmentConfigs'

// Kept here rather than alongside LayerProvider so BusinessProvider, which
// LayerProvider renders, can read these types without depending back on it.

export type { EventCallbacks }

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

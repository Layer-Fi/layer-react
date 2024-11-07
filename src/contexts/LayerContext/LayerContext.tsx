import { createContext, useContext } from 'react'
import { ToastProps } from '../../components/Toast/Toast'
import { LayerContextValues } from '../../types'
import {
  LayerContextHelpers,
  LayerThemeConfig,
} from '../../types/layer_context'

export const LayerContext = createContext<
  LayerContextValues &
    LayerContextHelpers & { setTheme: (theme: LayerThemeConfig) => void }
>({
  auth: {
    access_token: '',
    expires_at: new Date(2000, 1, 1),
    expires_in: -1,
    token_type: '',
  },
  businessId: '',
  business: undefined,
  categories: [],
  apiUrl: '',
  theme: undefined,
  colors: {},
  usePlaidSandbox: true,
  setTheme: () => undefined,
  getColor: _shade => undefined,
  setLightColor: () => undefined,
  setDarkColor: () => undefined,
  setTextColor: () => undefined,
  setColors: () => undefined,
  onboardingStep: undefined,
  setOnboardingStep: () => undefined,
  environment: '',
  toasts: [],
  addToast: (_toast: ToastProps) => undefined,
  removeToast: () => undefined,
  onError: () => undefined,
  touch: () => undefined,
  read: () => undefined,
  syncTimestamps: {},
  readTimestamps: {},
  hasBeenTouched: () => false,
  expireDataCaches: () => undefined,
  eventCallbacks: {},
})

export const useLayerContext = () => useContext(LayerContext)

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
      businessId: '',
      business: undefined,
      theme: undefined,
      colors: {},
      setTheme: () => undefined,
      getColor: _shade => undefined,
      setLightColor: () => undefined,
      setDarkColor: () => undefined,
      setTextColor: () => undefined,
      setColors: () => undefined,
      onboardingStep: undefined,
      setOnboardingStep: () => undefined,
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

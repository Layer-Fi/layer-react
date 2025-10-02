import { PropsWithChildren, useReducer, useEffect, Reducer, useMemo, useCallback } from 'react'
import { Layer } from '../../api/layer'
import { ToastProps, ToastsContainer } from '../../components/Toast/Toast'
import { LayerContext } from '../../contexts/LayerContext'
import { useDataSync } from '../../hooks/useDataSync'
import { errorHandler, LayerError } from '../../models/ErrorHandler'
import {
  ColorConfig,
  ColorsPaletteOption,
  LayerThemeConfig,
  OnboardingStep,
  type LayerContextAction,
  type LayerContextValues,
  LayerContextActionName as Action,
} from '../../types/layer_context'
import { buildColorsPalette } from '../../utils/colors'
import { LayerProviderProps } from '../LayerProvider/LayerProvider'
import useSWR from 'swr'
import { useAuth } from '../../hooks/useAuth'
import { useEnvironment } from '../Environment/EnvironmentInputProvider'
import { DEFAULT_SWR_CONFIG } from '../../utils/swr/defaultSWRConfig'
import { useAccountingConfiguration } from '../../hooks/useAccountingConfiguration/useAccountingConfiguration'
import { useGlobalDateRange, useGlobalDateRangeActions } from '../GlobalDateStore/GlobalDateStoreProvider'

const reducer: Reducer<LayerContextValues, LayerContextAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case Action.setBusiness:
    case Action.setTheme:
    case Action.setOnboardingStep:
    case Action.setColors:
      return { ...state, ...action.payload }
    case Action.setToast:
      return {
        ...state,
        toasts: [
          ...state.toasts,
          { ...action.payload.toast, isExiting: false },
        ],
      }
    case Action.setToastExit:
      return {
        ...state,
        toasts: state.toasts.map(toast =>
          toast.id === action.payload.toast.id
            ? { ...toast, isExiting: false }
            : toast,
        ),
      }
    case Action.removeToast:
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload.toast.id),
      }
    default:
      return state
  }
}

type BusinessProviderProps = PropsWithChildren<
  Pick<LayerProviderProps, 'businessId' | 'theme' | 'onError' | 'eventCallbacks'>
>

export const BusinessProvider = ({
  businessId,
  children,
  theme,
  onError,
  eventCallbacks,
}: PropsWithChildren<BusinessProviderProps>) => {
  errorHandler.setOnError(onError)

  const colors = buildColorsPalette(theme)

  const [state, dispatch] = useReducer(reducer, {
    businessId,
    business: undefined,
    theme,
    colors,
    onboardingStep: undefined,
    toasts: [],
    eventCallbacks: {},
  })

  const {
    touch,
    syncTimestamps,
    read,
    readTimestamps,
    hasBeenTouched,
    resetCaches,
  } = useDataSync()

  const globalDateRange = useGlobalDateRange({ displayMode: 'dayRangePicker' })
  const { setDateRange } = useGlobalDateRangeActions()

  const dateRange = useMemo(() => ({
    range: globalDateRange,
    setRange: setDateRange,
  }), [globalDateRange, setDateRange])

  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const { data: businessData } = useSWR(
    businessId && auth?.access_token && `business-${businessId}`,
    Layer.getBusiness(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
    {
      ...DEFAULT_SWR_CONFIG,
      provider: () => new Map(),
      onSuccess: (response) => {
        if (response?.data) {
          dispatch({
            type: Action.setBusiness,
            payload: { business: response.data || [] },
          })
        }
      },
    },
  )
  useEffect(() => {
    if (businessData?.data) {
      dispatch({
        type: Action.setBusiness,
        payload: { business: businessData.data || [] },
      })
    }
  }, [businessData])

  const setTheme = (theme: LayerThemeConfig) => {
    dispatch({
      type: Action.setTheme,
      payload: { theme },
    })

    dispatch({
      type: Action.setColors,
      payload: { colors: buildColorsPalette(theme) },
    })
  }

  const setLightColor = (color?: ColorConfig) => {
    setTheme({
      ...(state.theme ?? {}),
      colors: {
        ...(state.theme?.colors ?? {}),
        light: color,
      },
    })
  }

  const setDarkColor = (color?: ColorConfig) => {
    setTheme({
      ...(state.theme ?? {}),
      colors: {
        ...(state.theme?.colors ?? {}),
        dark: color,
      },
    })
  }

  const setTextColor = (color?: ColorConfig) => {
    setTheme({
      ...(state.theme ?? {}),
      colors: {
        ...(state.theme?.colors ?? {}),
        text: color,
      },
    })
  }

  const setToast = (toast: ToastProps) => {
    dispatch({ type: Action.setToast, payload: { toast: toast } })
  }

  const removeToast = (toast: ToastProps) => {
    dispatch({ type: Action.removeToast, payload: { toast: toast } })
  }

  const setToastExit = (toast: ToastProps) => {
    dispatch({ type: Action.setToastExit, payload: { toast: toast } })
  }

  const addToast = (toast: ToastProps) => {
    const id = `${Date.now()}-${Math.random()}`
    const newToast = { id, isExiting: false, ...toast }

    setToast(newToast)

    setTimeout(() => {
      removeToast(newToast)
      setTimeout(() => {
        setToastExit(newToast)
      }, 1000)
    }, toast.duration || 3000)
  }

  const setColors = (colors?: { dark?: ColorConfig, light?: ColorConfig }) =>
    setTheme({
      ...(state.theme ?? {}),
      colors,
    })

  const getColor = (shade: number): ColorsPaletteOption | undefined => {
    if (state.colors && shade in state.colors) {
      return state.colors[shade]
    }

    return
  }

  const { data: accountingConfiguration } = useAccountingConfiguration({ businessId })

  const setOnboardingStep = useCallback((value: OnboardingStep) =>
    dispatch({
      type: Action.setOnboardingStep,
      payload: { onboardingStep: value },
    }),
  [])

  return (
    <LayerContext.Provider
      value={{
        ...state,
        setTheme,
        getColor,
        setLightColor,
        setDarkColor,
        setTextColor,
        setColors,
        setOnboardingStep,
        addToast,
        removeToast,
        onError: (payload: LayerError) => errorHandler.onError(payload),
        touch,
        read,
        syncTimestamps,
        readTimestamps,
        expireDataCaches: resetCaches,
        hasBeenTouched,
        eventCallbacks,
        accountingConfiguration,
        dateRange,
      }}
    >
      {children}
      <ToastsContainer />
    </LayerContext.Provider>
  )
}

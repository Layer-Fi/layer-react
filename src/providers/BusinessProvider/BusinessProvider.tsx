import { type PropsWithChildren, type Reducer, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import {
  type ColorConfig,
  type ColorsPaletteOption,
  type LayerContextAction,
  LayerContextActionName as Action,
  type LayerContextValues,
  type LayerThemeConfig,
} from '@internal-types/layerContext'
import { errorHandler, type LayerError } from '@utils/api/errorHandler'
import { getActivationDate } from '@utils/business'
import { buildColorsPalette } from '@utils/colors'
import { clampToValidRange } from '@utils/date/dateRange'
import { useAccountingConfiguration } from '@hooks/api/businesses/[business-id]/accounting-config/useAccountingConfiguration'
import { useBusiness } from '@hooks/api/businesses/[business-id]/useBusiness'
import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { type LayerEvent } from '@providers/LayerProvider/layerEvents'
import { type LayerProviderProps } from '@providers/LayerProvider/LayerProvider'
import { BankAccountsProvider } from '@contexts/BankAccountsContext/BankAccountsContext'
import { LayerContext } from '@contexts/LayerContext/LayerContext'
import { type ToastProps, ToastsContainer } from '@components/Toast/Toast'

const reducer: Reducer<LayerContextValues, LayerContextAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case Action.setBusiness:
    case Action.setTheme:
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

  // Store latest callbacks in ref to prevent unnecessary re-renders
  const eventCallbacksRef = useRef(eventCallbacks)

  useEffect(() => {
    eventCallbacksRef.current = eventCallbacks
  }, [eventCallbacks])

  // Create stable callback wrappers that always call the latest version
  const stableEventCallbacks = useMemo(() => ({
    onEvent: (event: LayerEvent) => {
      eventCallbacksRef.current?.onEvent?.(event)
    },
    onTransactionCategorized: () => {
      eventCallbacksRef.current?.onTransactionCategorized?.()
    },
    onTransactionsFetched: () => {
      eventCallbacksRef.current?.onTransactionsFetched?.()
    },
  }), [])

  const [state, dispatch] = useReducer(reducer, {
    businessId,
    business: undefined,
    theme,
    colors,
    onboardingStep: undefined,
    toasts: [],
    eventCallbacks: {},
  })

  const { data: businessData } = useBusiness({ businessId })

  const globalDateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()

  // Clamp the exposed range start up to the activation date so consumers of the
  // public `dateRange` never see a pre-activation start (e.g. the "All Time"
  // fallback minimum). No-ops until the business — and its activation date —
  // has resolved.
  const dateRange = useMemo(() => {
    const activationDate = getActivationDate(businessData?.data)
    const range = activationDate
      ? clampToValidRange(globalDateRange, { now: new Date(), activationDate })
      : globalDateRange

    return { range, setRange: setDateRange }
  }, [globalDateRange, setDateRange, businessData])

  useEffect(() => {
    if (!businessData) return

    dispatch({
      type: Action.setBusiness,
      payload: { business: businessData.data },
    })
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

  // Deprecated no-op: onboardingStep no longer drives any UI now that the
  // Onboarding component has been removed.
  const setOnboardingStep = useCallback(() => {}, [])

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
        eventCallbacks: stableEventCallbacks,
        accountingConfiguration,
        dateRange,
      }}
    >
      <BankAccountsProvider>
        {children}
      </BankAccountsProvider>
      <ToastsContainer />
    </LayerContext.Provider>
  )
}

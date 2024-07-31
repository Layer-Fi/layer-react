import React, { PropsWithChildren, useReducer, useEffect, Reducer } from 'react'
import { Layer } from '../../api/layer'
import { GlobalWidgets } from '../../components/GlobalWidgets'
import { ToastProps } from '../../components/Toast/Toast'
import { DrawerContext } from '../../contexts/DrawerContext'
import { LayerContext } from '../../contexts/LayerContext'
import { useDataSync } from '../../hooks/useDataSync'
import { useDrawer } from '../../hooks/useDrawer'
import { LayerError, errorHandler } from '../../models/ErrorHandler'
import { BankTransactionsProvider } from '../../providers/BankTransactionsProvider'
import {
  LayerContextValues,
  LayerContextAction,
  LayerContextActionName as Action,
  BankTransaction,
} from '../../types'
import {
  ColorConfig,
  ColorsPaletteOption,
  LayerThemeConfig,
  OnboardingStep,
} from '../../types/layer_context'
import { buildColorsPalette } from '../../utils/colors'
import { add, isBefore } from 'date-fns'
import useSWR, { SWRConfig } from 'swr'

const reducer: Reducer<LayerContextValues, LayerContextAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case Action.setAuth:
    case Action.setBusiness:
    case Action.setCategories:
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

export const LayerProvider = ({
  appId,
  appSecret,
  businessId,
  children,
  businessAccessToken,
  environment = 'production',
  theme,
  usePlaidSandbox,
  onError,
  eventCallbacks,
}: PropsWithChildren<Props>) => {
  const defaultSWRConfig = {
    revalidateInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  }

  errorHandler.setOnError(onError)

  const colors = buildColorsPalette(theme)

  const { url, scope, apiUrl } = LayerEnvironment[environment]
  const [state, dispatch] = useReducer(reducer, {
    auth: {
      access_token: '',
      token_type: '',
      expires_in: 0,
      expires_at: new Date(2000, 1, 1),
    },
    businessId,
    business: undefined,
    categories: [],
    apiUrl,
    theme,
    colors,
    usePlaidSandbox,
    onboardingStep: undefined,
    environment,
    toasts: [],
    eventCallbacks: {},
  })

  const { touch, syncTimestamps, read, readTimestamps, hasBeenTouched } =
    useDataSync()

  const { data: auth } =
    appId !== undefined && appSecret !== undefined
      ? useSWR(
          businessAccessToken === undefined &&
            appId !== undefined &&
            appSecret !== undefined &&
            isBefore(state.auth.expires_at, new Date()) &&
            'authenticate',
          Layer.authenticate({
            appId,
            appSecret,
            authenticationUrl: url,
            scope,
          }),
          defaultSWRConfig,
        )
      : { data: undefined }

  useEffect(() => {
    if (businessAccessToken) {
      dispatch({
        type: Action.setAuth,
        payload: {
          auth: {
            access_token: businessAccessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            expires_at: add(new Date(), { seconds: 3600.0 }),
          },
        },
      })
    } else if (auth?.access_token) {
      dispatch({
        type: Action.setAuth,
        payload: {
          auth: {
            ...auth,
            expires_at: add(new Date(), { seconds: auth.expires_in }),
          },
        },
      })
    }
  }, [businessAccessToken, auth?.access_token])

  useSWR(
    businessId && state.auth?.access_token && `categories-${businessId}`,
    Layer.getCategories(apiUrl, state.auth?.access_token, {
      params: { businessId },
    }),
    {
      ...defaultSWRConfig,
      onSuccess: response => {
        if (response?.data?.categories?.length) {
          dispatch({
            type: Action.setCategories,
            payload: { categories: response.data.categories || [] },
          })
        }
      },
    },
  )

  useSWR(
    businessId && state?.auth?.access_token && `business-${businessId}`,
    Layer.getBusiness(apiUrl, state?.auth?.access_token, {
      params: { businessId },
    }),
    {
      ...defaultSWRConfig,
      onSuccess: response => {
        if (response?.data) {
          dispatch({
            type: Action.setBusiness,
            payload: { business: response.data || [] },
          })
        }
      },
    },
  )

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
    }, toast.duration || 2000)
  }

  const setColors = (colors?: { dark?: ColorConfig; light?: ColorConfig }) =>
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

  const setOnboardingStep = (value: OnboardingStep) =>
    dispatch({
      type: Action.setOnboardingStep,
      payload: { onboardingStep: value },
    })

  const drawerContextData = useDrawer()

  return (
    <SWRConfig value={defaultSWRConfig}>
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
          onError: errorHandler.onError,
          touch,
          read,
          syncTimestamps,
          readTimestamps,
          hasBeenTouched,
          eventCallbacks,
        }}
      >
        <BankTransactionsProvider>
          <DrawerContext.Provider value={drawerContextData}>
            {children}
            <GlobalWidgets />
          </DrawerContext.Provider>
        </BankTransactionsProvider>
      </LayerContext.Provider>
    </SWRConfig>
  )
}

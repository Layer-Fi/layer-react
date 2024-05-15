import React, {
  PropsWithChildren,
  useReducer,
  useEffect,
  Reducer,
  useState,
} from 'react'
import { Layer } from '../../api/layer'
import { LayerContext } from '../../contexts/LayerContext'
import {
  LayerContextValues,
  LayerContextAction,
  LayerContextActionName as Action,
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
    case Action.setCategories:
    case Action.setTheme:
    case Action.setOnboardingStep:
      return { ...state, ...action.payload }
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
    url: 'not defined yet',
    scope: 'not defined yet',
    apiUrl: 'not defined yet',
  },
  staging: {
    url: 'https://auth.layerfi.com/oauth2/token',
    scope: 'https://sandbox.layerfi.com/sandbox',
    apiUrl: 'https://sandbox.layerfi.com',
  },
}

export type Props = {
  businessId: string
  appId?: string
  appSecret?: string
  businessAccessToken?: string
  environment?: keyof typeof LayerEnvironment
  theme?: LayerThemeConfig
  usePlaidSandbox?: boolean
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
}: PropsWithChildren<Props>) => {
  const defaultSWRConfig = {
    revalidateInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  }

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
    categories: [],
    apiUrl,
    theme,
    colors,
    usePlaidSandbox,
    onboardingStep: undefined,
    environment,
  })

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
    businessId && auth?.access_token && `categories-${businessId}`,
    Layer.getCategories(apiUrl, auth?.access_token, { params: { businessId } }),
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

  const setTheme = (theme: LayerThemeConfig) =>
    dispatch({
      type: Action.setTheme,
      payload: { theme },
    })

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

  const setColors = (colors?: { dark?: ColorConfig; light?: ColorConfig }) => {
    setTheme({
      ...(state.theme ?? {}),
      colors,
    })
  }

  const getColor = (shade: number): ColorsPaletteOption | undefined => {
    if (colors && shade in colors) {
      return colors[shade]
    }

    return
  }

  const setOnboardingStep = (value: OnboardingStep) =>
    dispatch({
      type: Action.setOnboardingStep,
      payload: { onboardingStep: value },
    })

  return (
    <SWRConfig value={defaultSWRConfig}>
      <LayerContext.Provider
        value={{
          ...state,
          setTheme,
          getColor,
          setLightColor,
          setDarkColor,
          setColors,
          setOnboardingStep,
        }}
      >
        {children}
      </LayerContext.Provider>
    </SWRConfig>
  )
}

import React, { PropsWithChildren, useReducer, useEffect, Reducer } from 'react'
import { Layer } from '../../api/layer'
import { LayerContext } from '../../contexts/LayerContext'
import {
  LayerContextValues,
  LayerContextAction,
  LayerContextActionName as Action,
} from '../../types'
import { LayerThemeConfig } from '../../types/layer_context'
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
  appId: string
  appSecret: string
  clientId: string
  environment?: keyof typeof LayerEnvironment
  theme?: LayerThemeConfig
}

export const LayerProvider = ({
  appId,
  appSecret,
  businessId,
  children,
  clientId,
  environment = 'production',
  theme,
}: PropsWithChildren<Props>) => {
  const defaultSWRConfig = {
    revalidateInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  }

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
  })

  const { data: auth } = useSWR(
    isBefore(state.auth.expires_at, new Date()) && 'authenticate',
    Layer.authenticate({
      appId,
      appSecret,
      authenticationUrl: url,
      scope,
      clientId,
    }),
    defaultSWRConfig,
  )
  useEffect(() => {
    if (auth?.access_token) {
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
  }, [auth?.access_token])

  const { data: categories } = useSWR(
    businessId && auth?.access_token && `categories-${businessId}`,
    Layer.getCategories(apiUrl, auth?.access_token, { params: { businessId } }),
    defaultSWRConfig,
  )
  useEffect(() => {
    if (categories?.data?.categories?.length) {
      dispatch({
        type: Action.setCategories,
        payload: { categories: categories.data.categories || [] },
      })
    }
  }, [categories?.data?.categories?.length])

  const setTheme = (theme: LayerThemeConfig) =>
    dispatch({
      type: Action.setTheme,
      payload: { theme },
    })

  return (
    <SWRConfig value={defaultSWRConfig}>
      <LayerContext.Provider value={{ ...state, setTheme }}>
        {children}
      </LayerContext.Provider>
    </SWRConfig>
  )
}

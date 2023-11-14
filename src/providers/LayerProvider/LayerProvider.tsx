import React, { PropsWithChildren, useReducer, useEffect, Reducer } from 'react'
import Layer from '../../api/layer'
import { LayerContext } from '../../contexts/LayerContext'
import {
  LayerContextValues,
  LayerContextAction,
  LayerContextActionName as Action,
} from '../../types'
import useSWR, { SWRConfig } from 'swr'

const reducer: Reducer<LayerContextValues, LayerContextAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case Action.setAuth:
    case Action.setCategories:
      return { ...state, ...action.payload }
    default:
      return state
  }
}

type Props = {
  businessId: string
}

export const LayerProvider = ({
  businessId,
  children,
}: PropsWithChildren<Props>) => {
  const defaultSWRConfig = {
    revalidateInterval: 0,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  }

  const [state, dispatch] = useReducer(reducer, {
    auth: { access_token: '', token_type: '', expires_in: 0 },
    businessId,
    categories: [],
  })

  const { data: auth } = useSWR(
    'authenticate',
    Layer.authenticate,
    defaultSWRConfig,
  )
  useEffect(() => {
    if (!!auth?.access_token) {
      dispatch({ type: Action.setAuth, payload: { auth } })
    }
  }, [auth?.access_token])

  const { data: categories } = useSWR(
    businessId && auth?.access_token && `categories-${businessId}`,
    Layer.getCategories(auth?.access_token, { params: { businessId } }),
    defaultSWRConfig,
  )
  useEffect(() => {
    if (!!categories?.data?.categories?.length) {
      dispatch({
        type: Action.setCategories,
        payload: { categories: categories.data.categories || [] },
      })
    }
  }, [categories?.data?.categories?.length])

  return (
    <SWRConfig value={defaultSWRConfig}>
      <LayerContext.Provider value={state}>{children}</LayerContext.Provider>
    </SWRConfig>
  )
}

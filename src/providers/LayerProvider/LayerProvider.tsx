import React, { PropsWithChildren } from 'react'
import { LayerContext } from '../../contexts/LayerContext'
import { LayerExecutionContext } from '../../types'
import useSWR from 'swr'

const appId = '1pskub33qd9qt19406hi4d1j6f'
const appSecret = '1k7up1ia2m0ino8el6md2l1isq3t7fdj1eq6firmkui8757lk6r6'

export async function getAccessToken(): Promise<OAuthResponse> {
  var details = {
    grant_type: 'client_credentials',
    scope: 'https://sandbox.layerfi.com/sandbox',
    client_id: 'canaryAppId',
  }

  const formBody = Object.entries(details)
    .map(key => encodeURIComponent(key[0]) + '=' + encodeURIComponent(key[1]))
    .join('&')
  const authRequest = fetch('https://auth.layerfi.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(appId + ':' + appSecret),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
  })
  return (await (await authRequest).json()) as OAuthResponse
}

const getCategories = (accessToken: string) => (url: string) =>
  fetch(url, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
    method: 'GET',
  }).then(res => res.json())

type Props = {
  businessId: string
}

export const LayerProvider = ({
  businessId,
  children,
}: PropsWithChildren<Props>) => {
  const { data: auth } = useSWR(
    'https://auth.layerfi.com/oauth2/token',
    getAccessToken,
  )
  const { data: categories } = useSWR(
    businessId &&
      auth?.access_token &&
      `https://sandbox.layerfi.com/v1/businesses/${businessId}/categories`,
    getCategories(auth?.access_token),
  )
  const value: LayerExecutionContext = {
    auth,
    businessId,
    categories: categories?.data?.categories || [],
  }
  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>
}

import React, { PropsWithChildren } from 'react'
import { LayerContext } from '../../contexts/LayerContext'
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

type Props = {}

export const LayerProvider = ({ children }: PropsWithChildren<Props>) => {
  const { data: authData } = useSWR(
    'https://auth.layerfi.com/oauth2/token',
    getAccessToken,
  )
  return (
    <LayerContext.Provider value={authData}>{children}</LayerContext.Provider>
  )
}

import useSWR from 'swr'
import { EnvironmentConfigs, type Environment } from '../providers/Environment/environmentConfigs'
import type { OAuthResponse } from '../types'
import { useAuthInput } from '../providers/AuthInputProvider'
import { useEnvironment } from '../providers/Environment/EnvironmentInputProvider'

type ClientSpecificOptions = {
  appId: string
  appSecret: string
}
type EnvironmentDerivedOptions = Pick<(typeof EnvironmentConfigs)[Environment], 'authUrl' | 'scope'>

type RequestOptions = ClientSpecificOptions & EnvironmentDerivedOptions

async function requestOAuthToken({
  appId,
  appSecret,
  authUrl,
  scope,
}: RequestOptions) {
  return fetch(authUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + globalThis.btoa(appId + ':' + appSecret),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope,
      client_id: appId,
    }).toString(),
  })
    .then(res => res.json() as Promise<OAuthResponse>)
}

type KeyBuilderOptions = Partial<ClientSpecificOptions>
  & Pick<(typeof EnvironmentConfigs)[Environment], 'authUrl' | 'apiUrl' | 'scope'>
  & { businessAccessToken?: string }

function buildKey({
  appId,
  appSecret,
  businessAccessToken,
  apiUrl,
  authUrl,
  scope,
}: KeyBuilderOptions) {
  if (businessAccessToken) {
    return {
      apiUrl,
      businessAccessToken,
      mode: 'explicit' as const,
      tags: ['#auth'],
    }
  }

  if (appId && appSecret) {
    return {
      apiUrl,
      appId,
      appSecret,
      authUrl,
      scope,
      mode: 'client' as const,
      tags: ['#auth'],
    }
  }

  return null
}

const DEFAULT_EXPIRES_IN_SECONDS = 3600
const FALLBACK_REFRESH_MS = (DEFAULT_EXPIRES_IN_SECONDS / 2) * 1000

export function useAuth() {
  const {
    apiUrl,
    authUrl,
    scope,
  } = useEnvironment()
  const {
    appId,
    appSecret,
    businessAccessToken,
  } = useAuthInput()

  return useSWR(
    () => buildKey({ appId, appSecret, businessAccessToken, apiUrl, authUrl, scope }),
    (key) => {
      if (key.mode === 'explicit') {
        const { businessAccessToken, apiUrl } = key
        return {
          apiUrl,
          access_token: businessAccessToken,
          expires_in: DEFAULT_EXPIRES_IN_SECONDS,
          token_type: 'Bearer' as const,
        }
      }

      const { apiUrl, appId, appSecret, authUrl, scope } = key
      return requestOAuthToken({ appId, appSecret, authUrl, scope })
        .then(data => ({ apiUrl, ...data }))
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: (latestData) => {
        if (!latestData) {
          return FALLBACK_REFRESH_MS
        }

        return (latestData.expires_in / 2) * 1000
      },
    },
  )
}

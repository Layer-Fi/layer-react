import useSWR from 'swr'
import { EnvironmentConfigs, type Environment } from '../providers/LayerProvider/environment'
import type { OAuthResponse } from '../types'

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
      Authorization: 'Basic ' + globalThis.btoa(appId + ':' + appSecret),
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
  & {
    environment: Environment
    businessAccessToken?: string
  }

function buildKey({
  appId,
  appSecret,
  businessAccessToken,
  environment,
 }: KeyBuilderOptions) {
  if (businessAccessToken) {
    return {
      businessAccessToken,
      mode: 'explicit' as const,
      tags: [ '#auth' ],
    }
  }

  if (appId && appSecret) {
    const { authUrl, scope } = EnvironmentConfigs[environment]

    return {
      appId,
      appSecret,
      authUrl,
      scope,
      mode: 'client' as const,
      tags: [ '#auth' ],
    }
  }

  return null
}

const DEFAULT_EXPIRES_IN_SECONDS = 3600
const FALLBACK_REFRESH_MS = 1000

type AuthOptions = Partial<ClientSpecificOptions> & {
  environment?: Environment
  businessAccessToken?: string
}

export function useAuth({
  appId,
  appSecret,
  businessAccessToken,
  environment = 'production'
}: AuthOptions) {
  return useSWR(
    () => buildKey({ appId, appSecret, businessAccessToken, environment }),
    (key) => {
      if (key.mode === 'explicit') {
        const { businessAccessToken } = key
        return {
          expires_in: DEFAULT_EXPIRES_IN_SECONDS,
          token_type: 'Bearer' as const,
          access_token: businessAccessToken
        }
      }

      const { appId, appSecret, authUrl, scope } = key
      return requestOAuthToken({ appId, appSecret, authUrl, scope })
    },
    {
      refreshInterval: (latestData) => {
        if (!latestData) {
          return FALLBACK_REFRESH_MS
        }

        return (latestData.expires_in / 2) * 1000
      }
    }
  )
}

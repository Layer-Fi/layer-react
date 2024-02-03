import { OAuthResponse } from '../../types'
import { formStringFromObject } from '../util'

type AuthenticationArguments = {
  appId: string
  appSecret: string
  authenticationUrl?: string
  scope: string
}
export const authenticate =
  ({
    appId,
    appSecret,
    authenticationUrl = 'https://auth.layerfi.com/oauth2/token',
    scope,
  }: AuthenticationArguments) =>
  (): Promise<OAuthResponse> =>
    fetch(authenticationUrl, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(appId + ':' + appSecret),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formStringFromObject({
        grant_type: 'client_credentials',
        scope,
        client_id: appId,
      }),
    }).then(res => res.json() as Promise<OAuthResponse>)

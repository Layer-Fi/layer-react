import { OAuthResponse } from '../../types'
import { formStringFromObject } from '../util'

type AuthenticationArguments = {
  appId: string
  appSecret: string
  authenticationUrl?: string
  clientId: string
  scope: string
}
export const authenticate = ({
  appId,
  appSecret,
  authenticationUrl = 'https://auth.layerfi.com/oauth2/token',
  clientId,
  scope,
}: AuthenticationArguments): Promise<OAuthResponse> =>
  fetch(authenticationUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(appId + ':' + appSecret),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formStringFromObject({
      grant_type: 'client_credentials',
      scope,
      client_id: clientId,
    }),
  }).then(res => res.json() as Promise<OAuthResponse>)

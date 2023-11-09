import { OAuthResponse } from '../../types'
import { formStringFromObject } from '../util'

// These will be parameters or configurable per-environment in the future
const appId = '1pskub33qd9qt19406hi4d1j6f'
const appSecret = '1k7up1ia2m0ino8el6md2l1isq3t7fdj1eq6firmkui8757lk6r6'
const url = 'https://auth.layerfi.com/oauth2/token'
const details = {
  grant_type: 'client_credentials',
  scope: 'https://sandbox.layerfi.com/sandbox',
  client_id: 'canaryAppId',
}

export const authenticate = (): Promise<OAuthResponse> =>
  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(appId + ':' + appSecret),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formStringFromObject(details),
  }).then(res => res.json() as Promise<OAuthResponse>)

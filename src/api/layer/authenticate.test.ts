import { formStringFromObject } from '../util'
import { authenticate } from './authenticate'

describe(authenticate, () => {
  it('passes params to the url-making function and uses accessToken', async () => {
    const appId = '1pskub33qd9qt19406hi4d1j6f'
    const appSecret = '1k7up1ia2m0ino8el6md2l1isq3t7fdj1eq6firmkui8757lk6r6'
    const clientId = 'canaryAppId'
    const scope = 'https://sandbox.layerfi.com/sandbox'
    const token = btoa(`${appId}:${appSecret}`)

    await authenticate({
      appId,
      appSecret,
      authenticationUrl: 'https://auth.layerfi.com/oauth2/token',
      clientId,
      scope,
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://auth.layerfi.com/oauth2/token',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formStringFromObject({
          grant_type: 'client_credentials',
          scope,
          client_id: clientId,
        }),
      },
    )
  })
})

import { get, request } from './authenticated_http'

describe(get, () => {
  it('passes params to the url-making function and uses accessToken', () => {
    const urlMaker = ({ one }: Record<string, string>) => `http://layer/${one}`
    const locationLockedGet = get(urlMaker)
    const primedGet = locationLockedGet('access-token', {
      params: {
        one: 'ONE',
        two: '2',
      },
    })

    primedGet()

    expect(fetch).toHaveBeenCalledWith('http://layer/ONE', {
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })
  })
})

describe(request, () => {
  it('generates a function with a verb that makes an http request', async () => {
    const patch = request('patch')
    const urlMaker = ({ one }: Record<string, string>) => `http://layer/${one}`
    const lockedPatchFn = patch(urlMaker)

    await lockedPatchFn('access-token', {
      params: { one: 'TWO' },
      body: { data: 'hello' },
    })

    expect(fetch).toHaveBeenCalledWith('http://layer/TWO', {
      headers: {
        Authorization: 'Bearer access-token',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
      body: '{"data":"hello"}',
      method: 'PATCH',
    })
  })
})

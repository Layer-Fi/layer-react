import { get } from './authenticated_http'

describe(get, () => {
  it('passes params to the url-making function and uses accessToken', () => {
    const urlMaker = ({ one }: Record<string, string>) => `http://layer/${one}`
    const locationLockedGet = get(urlMaker)
    const primedGet = locationLockedGet('access-token', {
      one: 'ONE',
      two: '2',
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

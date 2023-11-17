export const get =
  <Return = Record<string, string>, Params = Record<string, string>>(
    url: (params: Params) => string,
  ) =>
  (accessToken: string | undefined, options?: { params?: Params }) =>
  (): Promise<Return> =>
    fetch(url(options?.params || ({} as Params)), {
      headers: {
        Authorization: 'Bearer ' + (accessToken || ''),
        'Content-Type': 'application/json',
      },
      method: 'GET',
    }).then(res => res.json() as Promise<Return>)

export const put =
  <
    Body = Record<string, string>,
    Return = Record<string, string>,
    Params = Record<string, string>,
  >(
    url: (params: Params) => string,
  ) =>
  (
    accessToken: string | undefined,
    options?: {
      params?: Params
      body?: Body
    },
  ): Promise<Return> =>
    fetch(url(options?.params || ({} as Params)), {
      headers: {
        Authorization: 'Bearer ' + (accessToken || ''),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      method: 'PUT',
      body: JSON.stringify(options?.body),
    }).then(res => res.json() as Promise<Return>)

export const get =
  <
    Return extends Record<string, unknown> = Record<string, unknown>,
    Params extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
  >(
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
    Body extends Record<string, unknown> = Record<string, unknown>,
    Return extends Record<string, unknown> = Record<string, unknown>,
    Params extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
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

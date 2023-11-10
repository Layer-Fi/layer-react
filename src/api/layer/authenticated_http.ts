export const get =
  (url: (params: Record<string, string>) => string) =>
  (
    accessToken: string | undefined,
    options?: { params?: Record<string, string> | undefined },
  ) =>
  () =>
    fetch(url(options?.params || {}), {
      headers: {
        Authorization: 'Bearer ' + (accessToken || ''),
        'Content-Type': 'application/json',
      },
      method: 'GET',
    }).then(res => res.json())

export const put =
  (url: (params: Record<string, string>) => string) =>
  (
    accessToken: string | undefined,
    options?: {
      params?: Record<string, string>
      body?: Record<string, unknown>
    },
  ) =>
    fetch(url(options?.params || {}), {
      headers: {
        Authorization: 'Bearer ' + (accessToken || ''),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      method: 'PUT',
      body: JSON.stringify(options?.body),
    }).then(res => res.json())

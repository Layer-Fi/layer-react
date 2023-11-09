export const get =
  (url: (params: Record<string, string>) => string) =>
  (
    accessToken: string | undefined,
    params: Record<string, string> | undefined,
  ) =>
  () =>
    fetch(url(params || {}), {
      headers: {
        Authorization: 'Bearer ' + (accessToken || ''),
        'Content-Type': 'application/json',
      },
      method: 'GET',
    }).then(res => res.json())

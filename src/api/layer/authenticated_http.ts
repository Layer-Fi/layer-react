import { APIError } from '../../models/APIError'

export type HTTPVerb = 'get' | 'put' | 'post' | 'patch' | 'options' | 'delete'

export interface ReturnError extends Error {
  info?: string
  status?: number
}

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
  (
    baseUrl: string,
    accessToken: string | undefined,
    options?: { params?: Params },
  ) =>
  (): Promise<Return> =>
    fetch(`${baseUrl}${url(options?.params || ({} as Params))}`, {
      headers: {
        Authorization: 'Bearer ' + (accessToken || ''),
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })
      .then(res => handleResponse<Return>(res))
      .catch(error => handleException(error))

export const request =
  (verb: HTTPVerb) =>
  <
    Return extends Record<string, unknown> = Record<string, unknown>,
    Body extends Record<string, unknown> = Record<string, unknown>,
    Params extends Record<string, string | undefined> = Record<
      string,
      string | undefined
    >,
  >(
    url: (params: Params) => string,
  ) =>
  (
    baseUrl: string,
    accessToken: string | undefined,
    options?: {
      params?: Params
      body?: Body
    },
  ): Promise<Return> =>
    fetch(`${baseUrl}${url(options?.params || ({} as Params))}`, {
      headers: {
        Authorization: 'Bearer ' + (accessToken || ''),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      method: verb.toUpperCase(),
      body: JSON.stringify(options?.body),
    })
      // .then(res => res.json() as Promise<Return>)
      .then(res => handleResponse<Return>(res))
      .catch(error => handleException(error))

export const post = request('post')
export const put = request('put')

const handleResponse = async <Return>(res: Response) => {
  if (!res.ok) {
    const errors = await tryToReadErrorsFromReponse(res)
    const apiError = new APIError(
      'An error occurred while fetching the data from API.',
      res.status,
      errors,
    )
    throw apiError
  }

  const parsedResponse = await res.json()
  if (parsedResponse && 'errors' in parsedResponse) {
    const apiError = new APIError(
      'Errors in the API response.',
      res.status,
      parsedResponse.errors ?? [],
    )
    throw apiError
  }

  return parsedResponse as Return
}

const handleException = async (error: Error) => {
  if (error.name === 'APIError') {
    throw error
  }

  const apiError = new APIError(
    'An error occurred while parsing the data from API.',
    undefined,
    [],
  )
  throw apiError
}

const tryToReadErrorsFromReponse = async (res?: Response) => {
  try {
    const data = await res?.json()
    return data?.errors ?? []
  } catch (_err) {
    return []
  }
}

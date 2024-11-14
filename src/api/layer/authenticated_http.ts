import { APIError } from '../../models/APIError'
import { reportError } from '../../models/ErrorHandler'

export type HTTPVerb = 'get' | 'put' | 'post' | 'patch' | 'options' | 'delete'

type DefaultParams = { businessId: string } & Record<string, string | undefined>

export const get =
  <
    Return extends Record<string, unknown> = Record<string, unknown>,
    Params extends DefaultParams = DefaultParams,
  >(
    url: (params: Params) => string,
  ) =>
  (
    baseUrl: string,
    accessToken: string | undefined,
    options: { params: Params },
  ) =>
  (): Promise<Return> =>
    fetch(`${baseUrl}${url(options.params)}`, {
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
    Params extends DefaultParams = DefaultParams,
  >(
    url: (params: Params) => string,
  ) =>
  (
    baseUrl: string,
    accessToken: string | undefined,
    options: {
      params: Params
      body?: Body
    },
  ): Promise<Return> =>
    fetch(`${baseUrl}${url(options.params)}`, {
      headers: {
        Authorization: 'Bearer ' + (accessToken || ''),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      method: verb.toUpperCase(),
      body: JSON.stringify(options?.body),
    })
      .then(res => handleResponse<Return>(res))
      .catch(error => handleException(error))

export const post = request('post')
export const put = request('put')
export const deleteRequest = request('delete')

export const postWithFormData = <
  Return extends Record<string, unknown> = Record<string, unknown>,
>(
  url: string,
  formData: FormData,
  baseUrl: string,
  accessToken: string | undefined,
): Promise<Return> => {
  return fetch(`${baseUrl}${url}`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + (accessToken || ''),
    },
    body: formData,
  })
    .then(res => handleResponse<Return>(res))
    .catch(error => handleException(error))
}

const handleResponse = async <Return>(res: Response) => {
  if (!res.ok) {
    const errors = await tryToReadErrorsFromResponse(res)
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

const handleException = async (error: Error | APIError) => {
  if (error.name === 'APIError') {
    reportError({
      type: (error as APIError).code === 401 ? 'unauthenticated' : 'api',
      payload: error,
    })

    throw error
  }

  const apiError = new APIError(
    'An error occurred while parsing the data from API.',
    undefined,
    [],
  )

  reportError({
    type: 'api',
    payload: apiError,
  })

  throw apiError
}

const tryToReadErrorsFromResponse = async (res?: Response) => {
  try {
    const data = await res?.json()
    return data?.errors ?? []
  } catch (_err) {
    return []
  }
}

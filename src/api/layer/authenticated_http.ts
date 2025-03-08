import { version as packageVersion } from '../../../package.json'
import { APIError, APIErrorMessage } from '../../models/APIError'
import { reportError } from '../../models/ErrorHandler'
import type { ParameterValues } from '../../utils/request/toDefinedSearchParameters'

const CUSTOM_PREFIX = 'Layer-'
const CUSTOM_HEADERS = {
  [`${CUSTOM_PREFIX}React-Version`]: packageVersion,
} as const

type APIResponseError = {
  description?: string
  type?: string
}

type FailedAPIResponse = {
  errors?: APIResponseError[]
}

export type HTTPVerb = 'get' | 'put' | 'post' | 'patch' | 'options' | 'delete'

export const get =
  <
    Return extends Record<string, unknown> = Record<string, unknown>,
    Params extends Record<string, ParameterValues | null | undefined> = Record<
      string,
      ParameterValues | null | undefined
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
            'Authorization': 'Bearer ' + (accessToken || ''),
            'Content-Type': 'application/json',
            ...CUSTOM_HEADERS,
          },
          method: 'GET',
        })
          .then(res => handleResponse<Return>(res))
          .catch((error: Error | APIError) => handleException(error))

export const request =
  (verb: Exclude<HTTPVerb, 'get'>) =>
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
            'Authorization': 'Bearer ' + (accessToken || ''),
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...CUSTOM_HEADERS,
          },
          method: verb.toUpperCase(),
          body: JSON.stringify(options?.body),
        })
          .then(res => handleResponse<Return>(res))
          .catch((error: Error | APIError) => handleException(error))

export const post = request('post')
export const put = request('put')

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
      ...CUSTOM_HEADERS,
    },
    body: formData,
  })
    .then(res => handleResponse<Return>(res))
    .catch((error: Error | APIError) => handleException(error))
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

  const parsedResponse = (await res.json()) as Return | FailedAPIResponse
  if (parsedResponse && 'errors' in (parsedResponse as FailedAPIResponse)) {
    const apiError = new APIError(
      'Errors in the API response.',
      res.status,
      ((parsedResponse as FailedAPIResponse).errors ?? []) as APIErrorMessage[],
    )
    throw apiError
  }

  return parsedResponse as Return
}

const handleException = (error: Error | APIError) => {
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
    const data = (await res?.json()) as FailedAPIResponse
    return data?.errors ?? []
  }
  catch (_err) {
    return []
  }
}

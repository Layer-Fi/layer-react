export type HTTPVerb = 'get' | 'put' | 'post' | 'patch' | 'options' | 'delete'

export interface ReturnError extends Error {
  info?: string
  status?: number
}

export class APIError extends Error {
  code: number | undefined
  info: string | undefined
  errors: Record<string, string>[] | undefined // { type?: string, description?: string }

  constructor(
    message: string,
    info?: string,
    code?: number,
    errors?: Record<string, string>[],
  ) {
    super(message)
    this.name = 'APIError'
    this.info = info
    this.code = code
    this.errors = errors

    Object.setPrototypeOf(this, APIError.prototype)
  }

  renderError() {
    return `API request failed: [${this.code}] ${this.info} / ${this.message}`
  }
}

const tryToParseErrorsFromReponse = async (res?: Response) => {
  try {
    console.log('try to parse 1', res)
    const data = await res?.json()
    console.log('try to parse 2', data)
    return data?.errors ?? []
  } catch (_err) {
    return []
  }
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
    }).then(async res => {
      if (!res.ok) {
        // @TODO - still try to parse res.json() - sometimes it's an array of errors
        // convert fields into an array of messages / errors (?)
        console.log(res.status)
        const errors = await tryToParseErrorsFromReponse(res)
        const error = new APIError(
          'An error occurred while fetching the data.',
          'Info of the error',
          res.status,
          errors,
        )
        // error.info = 'Info of the error'
        // error.code = res.status
        throw error
      }

      return res.json() as Promise<Return>
    })
// .then(data => {
//   return data
// })
// .catch((error: Error) => {
//   // console.log('catch', error)
//   return { error: error.message } as Return
// })

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
    }).then(res => res.json() as Promise<Return>)

export const post = request('post')
export const put = request('put')

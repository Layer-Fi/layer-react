import { Schema } from 'effect'

export type AuthenticatedRequest<TReturn, TParams> = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: TParams },
) => () => Promise<TReturn>

export type SWRKeyContext = {
  accessToken: string
  apiUrl: string
  tags: ReadonlyArray<string>
}

/*
 * Keys built by `createBuildKey`/`createInfiniteKeyLoader` are the request params plus
 * `accessToken`/`apiUrl`/`tags`; the fetcher strips the context and forwards the rest.
 */
export function createKeyedFetcher<
  TReturn,
  TParams extends Record<string, unknown>,
  TDecoded = TReturn,
>(
  request: AuthenticatedRequest<TReturn, TParams>,
  schema?: Schema.Schema<TDecoded, TReturn>,
) {
  return ({ accessToken, apiUrl, tags: _tags, ...params }: SWRKeyContext & TParams): Promise<TDecoded> => {
    const response = request(apiUrl, accessToken, { params: params as unknown as TParams })()

    if (schema) {
      return response.then(Schema.decodeUnknownPromise(schema))
    }

    return response as Promise<unknown> as Promise<TDecoded>
  }
}

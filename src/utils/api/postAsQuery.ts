import type { AuthenticatedRequest } from '@utils/swr/createKeyedFetcher'

export type MutationRequest<TReturn, TBody, TParams> = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: TParams, body?: TBody },
) => Promise<TReturn>

/*
 * Adapts a POST-backed read endpoint into the thunk shape `createKeyedFetcher` and the
 * query hook factories expect, deriving the request body from the params.
 */
export function postAsQuery<TReturn, TBody, TParams>(
  request: MutationRequest<TReturn, TBody, TParams>,
  toBody: (params: TParams) => TBody,
): AuthenticatedRequest<TReturn, TParams> {
  return (baseUrl, accessToken, options) => () =>
    request(baseUrl, accessToken, {
      params: options?.params,
      body: toBody(options?.params as TParams),
    })
}

/*
 * Adapts a GET-backed request into the shape `createMutationHook` expects, for
 * endpoints (e.g. report exports) that are triggered imperatively rather than on render.
 */
export function getAsMutation<TReturn, TParams>(
  request: AuthenticatedRequest<TReturn, TParams>,
): MutationRequest<TReturn, Record<string, unknown>, TParams> {
  return (baseUrl, accessToken, options) =>
    request(baseUrl, accessToken, { params: options?.params })()
}

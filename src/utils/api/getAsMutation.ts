import type { AuthenticatedRequest } from '@utils/swr/createKeyedFetcher'

export type MutationRequest<TReturn, TBody, TParams> = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: TParams, body?: TBody },
) => Promise<TReturn>

/*
 * Adapts a GET-shaped endpoint that semantically acts (e.g. report exports that generate
 * a file and mint a fresh presigned URL per call) into the mutation pipeline, so it only
 * runs on `trigger()` and is never cached or revalidated.
 *
 * Assign the result to a `const` before passing it to `createMutationHook`; inlined in the
 * config object, TypeScript fails to infer the factory's type params from it.
 */
export function getAsMutation<TReturn, TParams>(
  request: AuthenticatedRequest<TReturn, TParams>,
): MutationRequest<TReturn, Record<string, unknown>, TParams> {
  return (baseUrl, accessToken, options) =>
    request(baseUrl, accessToken, { params: options?.params })()
}

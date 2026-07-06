import { get } from '@utils/api/authenticatedHttp'
import { type QueryParams, toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import type { AuthenticatedRequest } from '@utils/swr/createKeyedFetcher'

/*
 * Named path params go into the URL; all remaining params become search params.
 * `transformQuery` replaces that default for renames, constants, or flattening.
 */
export function getWithQuery<
  TReturn extends Record<string, unknown>,
  TParams extends Record<string, unknown>,
>(
  pathParamKeys: ReadonlyArray<keyof TParams>,
  buildPath: (params: TParams) => string,
  transformQuery?: (params: TParams) => QueryParams,
): AuthenticatedRequest<TReturn, TParams> {
  const buildUrl = (params: TParams) => {
    const query = transformQuery
      ? transformQuery(params)
      : Object.fromEntries(
        Object.entries(params).filter(
          ([key]) => !(pathParamKeys as ReadonlyArray<string>).includes(key),
        ),
      ) as QueryParams

    const path = buildPath(params)
    const queryString = toDefinedSearchParameters(query).toString()

    return queryString ? `${path}?${queryString}` : path
  }

  // TParams may be richer than `get`'s serializable-params constraint (e.g. nested
  // filter objects handled by transformQuery), so the builder is cast at the boundary.
  return get<TReturn>(buildUrl as (params: QueryParams) => string) as AuthenticatedRequest<TReturn, TParams>
}

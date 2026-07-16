import { type Schema } from 'effect'
import useSWR, { type SWRConfiguration } from 'swr'

import { SWRQueryResult } from '@internal-types/swr/SWRResponseTypes'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { type AuthenticatedRequest, createKeyedFetcher, type SWRKeyContext } from '@utils/swr/createKeyedFetcher'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type BusinessScopedParams = { businessId: string }

type QueryHookOptions = {
  isEnabled?: boolean
  swrOptions?: SWRConfiguration
}

export function createQueryHook<
  TParams extends BusinessScopedParams,
  TEncoded,
  TDecoded = TEncoded,
  TData = TDecoded,
>(config: {
  /** Marks this hook's cache entries so global cache actions (invalidate, patch, force-reload) can find them. */
  tags: ReadonlyArray<string>
  /** The HTTP call to make. Receives every param the hook was called with, plus the injected auth and `businessId`. */
  request: AuthenticatedRequest<TEncoded, TParams>
  /** Decodes the raw response. Leave out for endpoints without a schema — the response is used as-is. */
  schema?: Schema.Schema<TDecoded, TEncoded>
  /** Reshapes the decoded response into the hook's `data` — e.g. unwrap an envelope or pick one field. */
  select?: (decoded: TDecoded) => TData
  /** Params fixed for every caller; baked into the key and request unless a call-site param overrides them. */
  keyDefaults?: Partial<Omit<TParams, 'businessId'>>
  /** Default SWR behavior for every caller. A caller's own `swrOptions` win, key by key. */
  swrOptions?: SWRConfiguration
  /** Whether the locale is part of the cache key (switching locale refetches). True by default. */
  isLocalized?: boolean
}) {
  const { tags, request, schema, select, keyDefaults, swrOptions, isLocalized = true } = config

  const buildKey = createBuildKey<TParams>(tags)
  const decodingFetcher = createKeyedFetcher(request, schema)

  const fetcher = (key: SWRKeyContext & TParams): Promise<TData> => {
    const decoded = decodingFetcher(key)

    if (select) {
      return decoded.then(select)
    }

    return decoded as Promise<unknown> as Promise<TData>
  }

  return function useQuery(params?: Omit<TParams, 'businessId'> & QueryHookOptions) {
    const { withLocale, businessId, auth } = useBuildKeyInputs()

    const { swrOptions: callSwrOptions, ...keyInputs } = params ?? ({} as QueryHookOptions)

    const swrResponse = useSWR<TData>(
      () => {
        const key = buildKey({
          ...auth,
          businessId,
          ...keyDefaults,
          ...keyInputs,
        } as Parameters<typeof buildKey>[0])

        return isLocalized ? withLocale(key) : key
      },
      fetcher,
      { ...swrOptions, ...callSwrOptions },
    )

    return new SWRQueryResult(swrResponse)
  }
}

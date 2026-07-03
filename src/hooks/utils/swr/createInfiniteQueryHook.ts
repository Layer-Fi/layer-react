import { type Schema } from 'effect'
import useSWRInfinite, { type SWRInfiniteConfiguration } from 'swr/infinite'

import type { PaginatedResponse } from '@schemas/common/pagination'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { type AuthenticatedRequest, createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type BusinessScopedParams = { businessId: string }

type InfiniteQueryHookOptions = {
  isEnabled?: boolean
  swrOptions?: SWRInfiniteConfiguration
}

export function createInfiniteQueryHook<
  TParams extends BusinessScopedParams & { cursor?: string },
  TEncoded,
  TDecoded extends PaginatedResponse<unknown>,
>(config: {
  /** Marks this hook's cache entries so global cache actions (invalidate, patch, force-reload) can find them. */
  tags: ReadonlyArray<string>
  /** The HTTP call for one page. Receives the hook-call params, plus the injected auth, `businessId`, and page `cursor`. */
  request: AuthenticatedRequest<TEncoded, TParams>
  /** Decodes one raw page; must produce a `PaginatedResponse` so the next page's cursor can be read. */
  schema: Schema.Schema<TDecoded, TEncoded>
  /** Params fixed for every caller (e.g. a page size); baked into each page's key and request. */
  keyDefaults?: Partial<Omit<TParams, 'businessId' | 'cursor'>>
  /** Default SWR-infinite behavior for every caller. A caller's own `swrOptions` win, key by key. */
  swrOptions?: SWRInfiniteConfiguration
  /** Whether the locale is part of the cache key (switching locale refetches). True by default. */
  isLocalized?: boolean
}) {
  const { tags, request, schema, keyDefaults, swrOptions, isLocalized = true } = config

  const keyLoader = createInfiniteKeyLoader<TParams, TDecoded>(tags)
  const fetcher = createKeyedFetcher(request, schema)

  return function useInfiniteQuery(params?: Omit<TParams, 'businessId' | 'cursor'> & InfiniteQueryHookOptions) {
    const { withLocale, businessId, auth } = useBuildKeyInputs()

    const { swrOptions: callSwrOptions, ...keyInputs } = params ?? ({} as InfiniteQueryHookOptions)

    const swrResponse = useSWRInfinite<TDecoded>(
      (_index: number, previousPageData: TDecoded | null) => {
        const key = keyLoader(
          previousPageData,
          {
            ...auth,
            businessId,
            ...keyDefaults,
            ...keyInputs,
          } as Parameters<typeof keyLoader>[1],
        )

        return isLocalized ? withLocale(key) : key
      },
      fetcher,
      {
        keepPreviousData: true,
        revalidateFirstPage: false,
        initialSize: 1,
        ...swrOptions,
        ...callSwrOptions,
      },
    )

    usePreserveInfiniteSize(swrResponse)

    return useSWRInfiniteResult(swrResponse)
  }
}

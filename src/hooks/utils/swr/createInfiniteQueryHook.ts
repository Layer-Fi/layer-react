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

/*
 * Business-scoped cursor-paginated `useSWRInfinite` hook factory; `businessId`, `cursor`,
 * auth, and locale are injected, so the returned hook takes the request params minus those.
 * `keyDefaults` bakes constants (e.g. a fixed page size) into the key and the request.
 */
export function createInfiniteQueryHook<
  TParams extends BusinessScopedParams & { cursor?: string },
  TEncoded,
  TDecoded extends PaginatedResponse<unknown>,
>(config: {
  tags: ReadonlyArray<string>
  request: AuthenticatedRequest<TEncoded, TParams>
  schema: Schema.Schema<TDecoded, TEncoded>
  keyDefaults?: Partial<Omit<TParams, 'businessId' | 'cursor'>>
  swrOptions?: SWRInfiniteConfiguration
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

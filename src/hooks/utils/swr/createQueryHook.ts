import { type Schema } from 'effect'
import useSWR, { type SWRConfiguration } from 'swr'

import { createBuildKey } from '@utils/swr/createBuildKey'
import { type AuthenticatedRequest, createKeyedFetcher, type SWRKeyContext } from '@utils/swr/createKeyedFetcher'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type BusinessScopedParams = { businessId: string }

type QueryHookOptions = {
  isEnabled?: boolean
  swrOptions?: SWRConfiguration
}

/*
 * Business-scoped `useSWR` hook factory; `businessId`, auth, and locale are injected,
 * so the returned hook takes the request params minus `businessId`.
 */
export function createQueryHook<
  TParams extends BusinessScopedParams,
  TEncoded,
  TDecoded,
  TData = TDecoded,
>(config: {
  tags: ReadonlyArray<string>
  request: AuthenticatedRequest<TEncoded, TParams>
  schema: Schema.Schema<TDecoded, TEncoded>
  select?: (decoded: TDecoded) => TData
  swrOptions?: SWRConfiguration
  isLocalized?: boolean
}) {
  const { tags, request, schema, select, swrOptions, isLocalized = true } = config

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

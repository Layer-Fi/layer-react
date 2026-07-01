import { useCallback, useMemo } from 'react'
import { Schema } from 'effect'
import { debounce } from 'lodash-es'
import useSWRInfinite, { type SWRInfiniteConfiguration } from 'swr/infinite'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createKeyMatcher } from '@utils/swr/createKeyMatcher'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const GetBankTransactionsResponseSchema = PaginatedResponseSchema(BankTransactionSchema)

export type GetBankTransactionsReturn = typeof GetBankTransactionsResponseSchema.Type

type GetBankTransactionsPaginatedParams = {
  businessId: string
  categorized?: boolean
  direction?: 'INFLOW' | 'OUTFLOW'
  query?: string
  startDate?: Date
  endDate?: Date
  tagFilterQueryString?: string
  sortOrder?: 'ASC' | 'DESC'
  sortBy?: string
  cursor?: string
  limit?: number
}

const getBankTransactions = get<
  Record<string, unknown>,
  GetBankTransactionsPaginatedParams
>(
  ({
    businessId,
    cursor,
    categorized,
    direction,
    limit,
    query,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'DESC',
    tagFilterQueryString,
  }: GetBankTransactionsPaginatedParams) => {
    const parameters = toDefinedSearchParameters({
      cursor,
      categorized,
      direction,
      q: query,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      limit,
    })

    return `/v1/businesses/${businessId}/bank-transactions?${parameters}${tagFilterQueryString ? `&${tagFilterQueryString}` : ''}`
  },
)

export const BANK_TRANSACTIONS_TAG_KEY = '#bank-transactions'

export type UseBankTransactionsOptions = {
  categorized?: boolean
  direction?: 'INFLOW' | 'OUTFLOW'
  query?: string
  startDate?: Date
  endDate?: Date
  tagFilterQueryString?: string
}

const keyLoader = createInfiniteKeyLoader<
  UseBankTransactionsOptions & { businessId: string },
  GetBankTransactionsReturn
>([BANK_TRANSACTIONS_TAG_KEY])

export type BankTransactionsKey = NonNullable<ReturnType<typeof keyLoader>>

const compareDates = (a: unknown, b: unknown) =>
  (a as Date | undefined)?.getTime() === (b as Date | undefined)?.getTime()

const keyMatchesParams = createKeyMatcher<BankTransactionsKey, UseBankTransactionsOptions>([
  { key: 'categorized' },
  { key: 'direction' },
  { key: 'query' },
  { key: 'startDate', compare: compareDates },
  { key: 'endDate', compare: compareDates },
  { key: 'tagFilterQueryString' },
])

export function useBankTransactions({
  categorized,
  direction,
  query,
  startDate,
  endDate,
  tagFilterQueryString,
}: UseBankTransactionsOptions, config?: SWRInfiniteConfiguration<GetBankTransactionsReturn>) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: GetBankTransactionsReturn | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...auth,
        businessId,
        categorized,
        direction,
        query,
        startDate,
        endDate,
        tagFilterQueryString,
      },
    )),
    ({
      accessToken,
      apiUrl,
      businessId,
      categorized,
      cursor,
      direction,
      query,
      startDate,
      endDate,
      tagFilterQueryString,
    }: NonNullable<ReturnType<typeof keyLoader>>) => {
      return getBankTransactions(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            categorized,
            cursor,
            direction,
            limit: 200,
            query,
            startDate,
            endDate,
            tagFilterQueryString,
          },
        },
      )().then(Schema.decodeUnknownPromise(GetBankTransactionsResponseSchema))
    },
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
      ...config,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return useSWRInfiniteResult(swrResponse)
}

const INVALIDATION_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

const useBankTransactionsBaseGlobalCacheActions = createInfiniteQueryGlobalCacheActions<BankTransaction>(BANK_TRANSACTIONS_TAG_KEY)

export const useBankTransactionsGlobalCacheActions = () => {
  const {
    invalidate: invalidateBankTransactions,
    forceReload: forceReloadBankTransactions,
    optimisticallyUpdate: optimisticallyUpdateBankTransactions,
  } = useBankTransactionsBaseGlobalCacheActions()
  const { forceReload } = useGlobalCacheActions()

  const forceReloadBackgroundBankTransactions = useCallback(
    (currentParams: UseBankTransactionsOptions) =>
      forceReload<BankTransactionsKey>(({ tags, key }) => {
        if (!tags.includes(BANK_TRANSACTIONS_TAG_KEY)) {
          return false
        }

        return !keyMatchesParams(key, currentParams)
      }),
    [forceReload],
  )

  const debouncedInvalidateBankTransactions = useMemo(
    () => debounce(
      invalidateBankTransactions,
      INVALIDATION_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATION_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateBankTransactions],
  )

  return {
    invalidateBankTransactions,
    debouncedInvalidateBankTransactions,
    forceReloadBankTransactions,
    forceReloadBackgroundBankTransactions,
    optimisticallyUpdateBankTransactions,
  }
}

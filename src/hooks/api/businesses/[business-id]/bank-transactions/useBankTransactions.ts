import { useCallback, useMemo } from 'react'
import { Schema } from 'effect'
import { debounce } from 'lodash-es'
import useSWRInfinite, { type SWRInfiniteConfiguration } from 'swr/infinite'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createKeyMatcher } from '@utils/swr/createKeyMatcher'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

export type UseBankTransactionsOptions = {
  categorized?: boolean
  direction?: 'INFLOW' | 'OUTFLOW'
  query?: string
  startDate?: Date
  endDate?: Date
  tagFilterQueryString?: string
}

function keyLoader(
  previousPageData: GetBankTransactionsReturn | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    categorized,
    direction,
    query,
    startDate,
    endDate,
    tagFilterQueryString,
  }: UseBankTransactionsOptions & {
    access_token?: string
    apiUrl?: string
    businessId: string
  },
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      categorized,
      cursor: previousPageData?.meta?.pagination.cursor ?? undefined,
      direction,
      query,
      startDate,
      endDate,
      tagFilterQueryString,
      tags: [BANK_TRANSACTIONS_TAG_KEY],
    } as const
  }
}

export function useBankTransactions({
  categorized,
  direction,
  query,
  startDate,
  endDate,
  tagFilterQueryString,
}: UseBankTransactionsOptions, config?: SWRInfiniteConfiguration<GetBankTransactionsReturn>) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: GetBankTransactionsReturn | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...data,
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

type BankTransactionsInvalidateOptions = {
  withPrecedingOptimisticUpdate?: boolean
}

export const useBankTransactionsGlobalCacheActions = () => {
  const { invalidate, optimisticUpdate, forceReload } = useGlobalCacheActions()

  const forceReloadBankTransactions = useCallback(
    () => forceReload(({ tags }) => tags.includes(BANK_TRANSACTIONS_TAG_KEY)),
    [forceReload],
  )

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

  const invalidateBankTransactions = useCallback(
    (invalidateOptions?: BankTransactionsInvalidateOptions) => invalidate(
      ({ tags }) => tags.includes(BANK_TRANSACTIONS_TAG_KEY),
      invalidateOptions,
    ),
    [invalidate],
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

  const optimisticallyUpdateBankTransactions = useCallback(
    (
      transformTransaction: (txn: BankTransaction) => BankTransaction,
    ) =>
      optimisticUpdate<
        Array<GetBankTransactionsReturn> | GetBankTransactionsReturn
      >(
        ({ tags }) => tags.includes(BANK_TRANSACTIONS_TAG_KEY),
        (currentData) => {
          const iterateOverPage = (page: GetBankTransactionsReturn) => {
            return {
              ...page,
              data: page.data.map(txn => transformTransaction(txn)),
            }
          }

          if (Array.isArray(currentData)) {
            return currentData.map(iterateOverPage)
          }

          /*
           * The cache contains entries for both the single page and the list of page entries.
           *
           * To avoid duplicated work, we intentionally do not apply any transformation to
           * the single page.
           */
          return currentData
        },
      ),
    [optimisticUpdate],
  )

  return {
    invalidateBankTransactions,
    debouncedInvalidateBankTransactions,
    forceReloadBankTransactions,
    forceReloadBackgroundBankTransactions,
    optimisticallyUpdateBankTransactions,
  }
}

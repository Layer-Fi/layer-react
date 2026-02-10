import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash-es'
import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite'

import type { BankTransaction } from '@internal-types/bank_transactions'
import { createKeyMatcher } from '@utils/swr/createKeyMatcher'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { getBankTransactions, type GetBankTransactionsReturn } from '@api/layer/bankTransactions'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

class BankTransactionsSWRResponse {
  private swrResponse: SWRInfiniteResponse<GetBankTransactionsReturn>

  constructor(swrResponse: SWRInfiniteResponse<GetBankTransactionsReturn>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get size() {
    return this.swrResponse.size
  }

  get setSize() {
    return this.swrResponse.setSize
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get mutate() {
    return this.swrResponse.mutate
  }

  get hasMore() {
    if (!this.data || this.data.length === 0) return false
    const lastPage = this.data[this.data.length - 1]
    return lastPage?.meta.pagination.has_more ?? false
  }
}

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
      cursor: previousPageData ? previousPageData.meta.pagination.cursor : undefined,
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
}: UseBankTransactionsOptions) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: GetBankTransactionsReturn | null) => keyLoader(
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
    ),
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
    }) => {
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
      )()
    },
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  return new BankTransactionsSWRResponse(swrResponse)
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

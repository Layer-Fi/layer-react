import useSWRInfinite from 'swr/infinite'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { getBankTransactions, type GetBankTransactionsReturn } from '../../api/layer/bankTransactions'
import { useGlobalCacheActions } from '../../utils/swr/useGlobalCacheActions'
import { useCallback, useMemo } from 'react'
import type { BankTransaction } from '../../types/bank_transactions'
import { debounce } from 'lodash'

export const BANK_TRANSACTIONS_TAG_KEY = '#bank-transactions'

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

  return useSWRInfinite(
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
    () => forceReload(tags => tags.includes(BANK_TRANSACTIONS_TAG_KEY)),
    [forceReload],
  )

  const invalidateBankTransactions = useCallback(
    (invalidateOptions?: BankTransactionsInvalidateOptions) => invalidate(
      tags => tags.includes(BANK_TRANSACTIONS_TAG_KEY),
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
        tags => tags.includes(BANK_TRANSACTIONS_TAG_KEY),
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
    optimisticallyUpdateBankTransactions,
  }
}

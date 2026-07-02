import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash-es'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createKeyMatcher } from '@utils/swr/createKeyMatcher'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

const GetBankTransactionsResponseSchema = PaginatedResponseSchema(BankTransactionSchema)

export type GetBankTransactionsReturn = typeof GetBankTransactionsResponseSchema.Type

export const BANK_TRANSACTIONS_TAG_KEY = '#bank-transactions'

export type UseBankTransactionsOptions = {
  categorized?: boolean
  direction?: 'INFLOW' | 'OUTFLOW'
  query?: string
  startDate?: Date
  endDate?: Date
  tagKey?: string
  tagValues?: string
}

type GetBankTransactionsPaginatedParams = UseBankTransactionsOptions & {
  businessId: string
  sortOrder?: 'ASC' | 'DESC'
  sortBy?: string
  cursor?: string
  limit?: number
}

const getBankTransactions = getWithQuery<
  typeof GetBankTransactionsResponseSchema.Encoded,
  GetBankTransactionsPaginatedParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/bank-transactions`,
  ({
    cursor,
    categorized,
    direction,
    query,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'DESC',
    limit,
    tagKey,
    tagValues,
  }) => ({
    cursor,
    categorized,
    direction,
    q: query,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    limit,
    tagKey,
    tagValues,
  }),
)

export const useBankTransactions = createInfiniteQueryHook({
  tags: [BANK_TRANSACTIONS_TAG_KEY],
  request: getBankTransactions,
  schema: GetBankTransactionsResponseSchema,
  keyDefaults: { limit: 200 },
})

export type BankTransactionsKey = UseBankTransactionsOptions & {
  accessToken: string
  apiUrl: string
  businessId: string
  cursor?: string
  limit?: number
  tags: ReadonlyArray<string>
}

const compareDates = (a: unknown, b: unknown) =>
  (a as Date | undefined)?.getTime() === (b as Date | undefined)?.getTime()

const keyMatchesParams = createKeyMatcher<BankTransactionsKey, UseBankTransactionsOptions>([
  { key: 'categorized' },
  { key: 'direction' },
  { key: 'query' },
  { key: 'startDate', compare: compareDates },
  { key: 'endDate', compare: compareDates },
  { key: 'tagKey' },
  { key: 'tagValues' },
])

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

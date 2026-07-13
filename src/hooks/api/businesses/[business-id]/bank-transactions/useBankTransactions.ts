import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash-es'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createKeyMatcher } from '@utils/swr/createKeyMatcher'
import { createInfiniteQueryGlobalCacheActions } from '@hooks/utils/swr/createInfiniteQueryGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'
import { useGlobalCacheActions } from '@hooks/utils/swr/useGlobalCacheActions'

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
  bankAccountIds?: string
  sourceAccountIds?: string
  amountMin?: number
  amountMax?: number
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
    bankAccountIds,
    sourceAccountIds,
    amountMin,
    amountMax,
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
    bankAccountIds,
    sourceAccountIds,
    amountMin,
    amountMax,
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
  { key: 'bankAccountIds' },
  { key: 'sourceAccountIds' },
  { key: 'amountMin' },
  { key: 'amountMax' },
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

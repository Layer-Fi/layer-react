import { endOfDay } from 'date-fns'

import type { BalanceSheet } from '@internal-types/balanceSheet'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export type GetBalanceSheetParams = {
  businessId: string
  effectiveDate: Date
}

const getBalanceSheet = getWithQuery<
  { data: BalanceSheet },
  GetBalanceSheetParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/balance-sheet`,
)

export const BALANCE_SHEET_TAG_KEY = '#balance-sheet'

const useBalanceSheetQuery = createQueryHook({
  tags: [BALANCE_SHEET_TAG_KEY],
  request: getBalanceSheet,
  select: ({ data }) => data,
})

export function useBalanceSheet({
  effectiveDate = endOfDay(new Date()),
}: {
  effectiveDate?: Date
}) {
  return useBalanceSheetQuery({ effectiveDate })
}

export const useBalanceSheetGlobalCacheActions = createResourceGlobalCacheActions<BalanceSheet>(BALANCE_SHEET_TAG_KEY)

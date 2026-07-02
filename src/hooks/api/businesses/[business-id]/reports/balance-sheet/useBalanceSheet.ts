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

export const useBalanceSheet = createQueryHook({
  tags: [BALANCE_SHEET_TAG_KEY],
  request: getBalanceSheet,
  select: ({ data }) => data,
})

export const useBalanceSheetGlobalCacheActions = createResourceGlobalCacheActions<BalanceSheet>(BALANCE_SHEET_TAG_KEY)

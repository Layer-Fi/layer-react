import { BalanceSheet } from '../../types'
import { get } from './authenticated_http'

export const getBalanceSheet = get<
  GetBalanceSheetReturn,
  GetBalanceSheetParams
>(
  ({ businessId, effectiveDate }: GetBalanceSheetParams) =>
    `/v1/businesses/${businessId}/reports/balance-sheet?effective_date=${encodeURIComponent(
      effectiveDate,
    )}`,
)

export type GetBalanceSheetReturn = {
  data?: BalanceSheet
  error?: unknown
}

export interface GetBalanceSheetParams
  extends Record<string, string | undefined> {
  businessId: string
  effectiveDate: string
}

import { BalanceSheet } from '../../types'
import { get } from './authenticated_http'

export const getBalanceSheet = get<
  GetBalanceSheetReturn,
  GetBalanceSheetParams
>(
  ({ businessId, effective_date }: GetBalanceSheetParams) =>
    `/v1/businesses/${businessId}/reports/balance-sheet?effective_date=${encodeURIComponent(
      effective_date,
    )}`,
)

export type GetBalanceSheetReturn = {
  data?: BalanceSheet
  error?: unknown
}

export interface GetBalanceSheetParams
  extends Record<string, string | undefined> {
  businessId: string
  effective_date: string
}

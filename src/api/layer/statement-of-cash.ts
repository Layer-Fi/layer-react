import { StatementOfCash } from '../../types'
import { get } from './authenticated_http'

export const getStatementOfCash = get<
  GetStatementOfCashReturn,
  GetStatementOfCashParams
>(
  ({ businessId, startDate, endDate }: GetStatementOfCashParams) =>
    `/v1/businesses/${businessId}/reports/cashflow-statement?start_date=${encodeURIComponent(
      startDate,
    )}&end_date=${encodeURIComponent(endDate)}`,
)

export type GetStatementOfCashReturn = {
  data?: StatementOfCash
  error?: unknown
}

export interface GetStatementOfCashParams
  extends Record<string, string | undefined> {
  businessId: string
  startDate: string
  endDate: string
}

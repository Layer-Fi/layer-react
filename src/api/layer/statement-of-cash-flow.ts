import { StatementOfCashFlow } from '../../types'
import { get } from './authenticated_http'

export const getStatementOfCashFlow = get<
  GetStatementOfCashFlowReturn,
  GetStatementOfCashFlowParams
>(
  ({ businessId, startDate, endDate }: GetStatementOfCashFlowParams) =>
    `/v1/businesses/${businessId}/reports/cashflow-statement?start_date=${encodeURIComponent(
      startDate,
    )}&end_date=${encodeURIComponent(endDate)}`,
)

export type GetStatementOfCashFlowReturn = {
  data?: StatementOfCashFlow
  error?: unknown
}

export interface GetStatementOfCashFlowParams
  extends Record<string, string | undefined> {
  businessId: string
  startDate: string
  endDate: string
}

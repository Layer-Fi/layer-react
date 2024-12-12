import { StatementOfCashFlow } from '../../types'
import type { S3PresignedUrl } from '../../types/general'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { get } from './authenticated_http'

type GetStatementOfCashFlowParams = {
  businessId: string
  startDate: string
  endDate: string
}

type GetStatementOfCashFlowReturn = {
  data?: StatementOfCashFlow
  error?: unknown
}

export const getStatementOfCashFlow = get<
  GetStatementOfCashFlowReturn,
  GetStatementOfCashFlowParams
>(
  ({ businessId, startDate, endDate }: GetStatementOfCashFlowParams) =>
    `/v1/businesses/${businessId}/reports/cashflow-statement?start_date=${encodeURIComponent(
      startDate,
    )}&end_date=${encodeURIComponent(endDate)}`,
)

export const getCashflowStatementCSV = get<
  { data: S3PresignedUrl },
  GetStatementOfCashFlowParams
>(
  ({ businessId, startDate, endDate }) => {
    const parameters = toDefinedSearchParameters({ startDate, endDate })

    return `/v1/businesses/${businessId}/reports/cashflow-statement/exports/csv?${parameters}`
  },
)

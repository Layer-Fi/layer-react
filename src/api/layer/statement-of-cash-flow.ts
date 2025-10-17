import type { S3PresignedUrl } from '../../types/general'
import type { StatementOfCashFlow } from '../../types/statement_of_cash_flow'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { get } from './authenticated_http'

type GetStatementOfCashFlowParams = {
  businessId: string
  startDate: Date
  endDate: Date
}

export const getStatementOfCashFlow = get<
  { data: StatementOfCashFlow },
  GetStatementOfCashFlowParams
>(
  ({ businessId, startDate, endDate }) => {
    const parameters = toDefinedSearchParameters({ startDate, endDate })

    return `/v1/businesses/${businessId}/reports/cashflow-statement?${parameters}`
  },
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

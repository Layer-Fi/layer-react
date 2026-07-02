import type { StatementOfCashFlow } from '@internal-types/statementOfCashFlow'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export type GetStatementOfCashFlowParams = {
  businessId: string
  startDate: Date
  endDate: Date
}

const getStatementOfCashFlow = getWithQuery<
  { data: StatementOfCashFlow },
  GetStatementOfCashFlowParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/cashflow-statement`,
)

export const STATEMENT_OF_CASH_FLOW_TAG_KEY = '#statement-of-cash-flow'

export const useStatementOfCashFlow = createQueryHook({
  tags: [STATEMENT_OF_CASH_FLOW_TAG_KEY],
  request: getStatementOfCashFlow,
  select: ({ data }) => data,
})

export const useStatementOfCashFlowGlobalCacheActions = createResourceGlobalCacheActions<StatementOfCashFlow>(STATEMENT_OF_CASH_FLOW_TAG_KEY)

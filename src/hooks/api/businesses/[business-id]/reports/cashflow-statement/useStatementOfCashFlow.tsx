import { endOfMonth, startOfMonth } from 'date-fns'

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

const useStatementOfCashFlowQuery = createQueryHook({
  tags: [STATEMENT_OF_CASH_FLOW_TAG_KEY],
  request: getStatementOfCashFlow,
  select: ({ data }) => data,
})

export function useStatementOfCashFlow({
  startDate = startOfMonth(new Date()),
  endDate = endOfMonth(new Date()),
}: {
  startDate?: Date
  endDate?: Date
}) {
  return useStatementOfCashFlowQuery({ startDate, endDate })
}

export const useStatementOfCashFlowGlobalCacheActions = createResourceGlobalCacheActions<StatementOfCashFlow>(STATEMENT_OF_CASH_FLOW_TAG_KEY)

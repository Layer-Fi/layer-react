import { endOfMonth, startOfMonth } from 'date-fns'
import useSWR from 'swr'

import type { StatementOfCashFlow } from '@internal-types/statementOfCashFlow'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

const fetchStatementOfCashFlow = createKeyedFetcher(getStatementOfCashFlow)

export const STATEMENT_OF_CASH_FLOW_TAG_KEY = '#statement-of-cash-flow'

const buildKey = createBuildKey<GetStatementOfCashFlowParams>([STATEMENT_OF_CASH_FLOW_TAG_KEY])

export function useStatementOfCashFlow({
  startDate = startOfMonth(new Date()),
  endDate = endOfMonth(new Date()),
}: {
  startDate?: Date
  endDate?: Date
}) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    withLocale(buildKey({
      ...auth,
      businessId,
      startDate,
      endDate,
    })),
    key => fetchStatementOfCashFlow(key).then(({ data }) => data),
  )

  return new SWRQueryResult(response)
}

export const useStatementOfCashFlowGlobalCacheActions = createResourceGlobalCacheActions<StatementOfCashFlow>(STATEMENT_OF_CASH_FLOW_TAG_KEY)

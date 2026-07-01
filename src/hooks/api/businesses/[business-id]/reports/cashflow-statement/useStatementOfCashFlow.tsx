import { endOfMonth, startOfMonth } from 'date-fns'
import useSWR from 'swr'

import type { StatementOfCashFlow } from '@internal-types/statementOfCashFlow'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export type GetStatementOfCashFlowParams = {
  businessId: string
  startDate: Date
  endDate: Date
}

const getStatementOfCashFlow = get<
  { data: StatementOfCashFlow },
  GetStatementOfCashFlowParams
>(
  ({ businessId, startDate, endDate }) => {
    const parameters = toDefinedSearchParameters({ startDate, endDate })

    return `/v1/businesses/${businessId}/reports/cashflow-statement?${parameters}`
  },
)

export const STATEMENT_OF_CASH_FLOW_TAG_KEY = '#statement-of-cash-flow'

const buildKey = createBuildKey<{ businessId: string, startDate: Date, endDate: Date }>([STATEMENT_OF_CASH_FLOW_TAG_KEY])

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
    ({ apiUrl, accessToken, startDate, endDate }) => getStatementOfCashFlow(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          startDate,
          endDate,
        },
      })().then(({ data }) => data),
  )

  return new SWRQueryResult(response)
}

export const useStatementOfCashFlowGlobalCacheActions = createResourceGlobalCacheActions<StatementOfCashFlow>(STATEMENT_OF_CASH_FLOW_TAG_KEY)

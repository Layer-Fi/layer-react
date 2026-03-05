import { endOfMonth, startOfMonth } from 'date-fns'
import useSWR from 'swr'

import type { StatementOfCashFlow } from '@internal-types/statement_of_cash_flow'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type GetStatementOfCashFlowParams = {
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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  startDate,
  endDate,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  startDate: Date
  endDate: Date
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startDate,
      endDate,
      tags: ['#statement-of-cash-flow'],
    } as const
  }
}

export function useStatementOfCashFlow({
  startDate = startOfMonth(new Date()),
  endDate = endOfMonth(new Date()),
}: {
  startDate?: Date
  endDate?: Date
}) {
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const response = useSWR(
    buildKey({
      ...auth,
      apiUrl,
      businessId,
      startDate,
      endDate,
    }),
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

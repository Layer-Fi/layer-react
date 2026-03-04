import { endOfMonth, startOfMonth } from 'date-fns'
import useSWR, { type SWRResponse } from 'swr'

import { type StatementOfCashFlow } from '@internal-types/statement_of_cash_flow'
import { getStatementOfCashFlow } from '@api/layer/statement-of-cash-flow'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type StatementOfCashFlowKey = {
  accessToken: string
  apiUrl: string
  businessId: string
  startDate: Date
  endDate: Date
  tags: ['#statement-of-cash-flow']
}

function buildKey({
  accessToken,
  apiUrl,
  businessId,
  startDate,
  endDate,
}: {
  accessToken?: string
  apiUrl?: string
  businessId: string
  startDate: Date
  endDate: Date
}): StatementOfCashFlowKey | null {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startDate,
      endDate,
      tags: ['#statement-of-cash-flow'],
    }
  }

  return null
}

export function useStatementOfCashFlow({
  startDate = startOfMonth(new Date()),
  endDate = endOfMonth(new Date()),
}: {
  startDate?: Date
  endDate?: Date
}): SWRResponse<StatementOfCashFlow, unknown> {
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()
  const authData = auth as { access_token?: string } | undefined
  const key = buildKey({
    accessToken: authData?.access_token,
    apiUrl,
    businessId,
    startDate,
    endDate,
  })

  return useSWR<StatementOfCashFlow, unknown, StatementOfCashFlowKey | null>(
    key,
    key => getStatementOfCashFlow(
      key.apiUrl,
      key.accessToken,
      {
        params: {
          businessId: key.businessId,
          startDate: key.startDate,
          endDate: key.endDate,
        },
      })().then(({ data }) => data),
  )
}

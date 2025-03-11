import { useLayerContext } from '../../contexts/LayerContext'
import useSWR from 'swr'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { getStatementOfCashFlow } from '../../api/layer/statement-of-cash-flow'
import { endOfMonth, startOfMonth } from 'date-fns'

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

  return useSWR(
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
}

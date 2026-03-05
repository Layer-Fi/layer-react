import { endOfDay } from 'date-fns'
import useSWR from 'swr'

import { getBalanceSheet } from '@api/layer/balance_sheet'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  effectiveDate,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  effectiveDate: Date
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      effectiveDate,
      tags: ['#balance-sheet'],
    } as const
  }
}

export function useBalanceSheet({
  effectiveDate = endOfDay(new Date()),
}: {
  effectiveDate?: Date
}) {
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...auth,
      apiUrl,
      businessId,
      effectiveDate,
    }),
    ({ accessToken, apiUrl, businessId, effectiveDate }) => getBalanceSheet(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          effectiveDate,
        },
      },
    )().then(({ data }) => data),
  )

  return {
    data: response.data,
    isLoading: response.isLoading,
    isValidating: response.isValidating,
    isError: response.error !== undefined,
    mutate: response.mutate,
  }
}

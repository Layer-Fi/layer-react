import { endOfDay } from 'date-fns'
import useSWR, { type SWRResponse } from 'swr'

import { type BalanceSheet } from '@internal-types/balance_sheet'
import { getBalanceSheet } from '@api/layer/balance_sheet'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type BalanceSheetKey = {
  accessToken: string
  apiUrl: string
  businessId: string
  effectiveDate: Date
  tags: ['#balance-sheet']
}

function buildKey({
  accessToken,
  apiUrl,
  businessId,
  effectiveDate,
}: {
  accessToken?: string
  apiUrl?: string
  businessId: string
  effectiveDate: Date
}): BalanceSheetKey | null {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      effectiveDate,
      tags: ['#balance-sheet'],
    }
  }

  return null
}

export function useBalanceSheet({
  effectiveDate = endOfDay(new Date()),
}: {
  effectiveDate?: Date
}): SWRResponse<BalanceSheet, unknown> {
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()
  const authData = auth as { access_token?: string } | undefined
  const key = buildKey({
    accessToken: authData?.access_token,
    apiUrl,
    businessId,
    effectiveDate,
  })

  return useSWR<BalanceSheet, unknown, BalanceSheetKey | null>(
    key,
    key => getBalanceSheet(
      key.apiUrl,
      key.accessToken,
      {
        params: {
          businessId: key.businessId,
          effectiveDate: key.effectiveDate,
        },
      },
    )().then(({ data }) => data),
  )
}

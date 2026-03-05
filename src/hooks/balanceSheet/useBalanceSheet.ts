import { endOfDay } from 'date-fns'
import useSWR from 'swr'

import type { BalanceSheet } from '@internal-types/balance_sheet'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type GetBalanceSheetParams = {
  businessId: string
  effectiveDate: Date
}

const getBalanceSheet = get<
  { data: BalanceSheet },
  GetBalanceSheetParams
>(
  ({ businessId, effectiveDate }) => {
    const parameters = toDefinedSearchParameters({ effectiveDate })

    return `/v1/businesses/${businessId}/reports/balance-sheet?${parameters}`
  },
)

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

  return new SWRQueryResult(response)
}

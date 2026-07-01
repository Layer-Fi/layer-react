import { endOfDay } from 'date-fns'
import useSWR from 'swr'

import type { BalanceSheet } from '@internal-types/balanceSheet'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

export const BALANCE_SHEET_TAG_KEY = '#balance-sheet'

const buildKey = createBuildKey<{ businessId: string, effectiveDate: Date }>([BALANCE_SHEET_TAG_KEY])

export function useBalanceSheet({
  effectiveDate = endOfDay(new Date()),
}: {
  effectiveDate?: Date
}) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      effectiveDate,
    })),
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

export const useBalanceSheetGlobalCacheActions = createResourceGlobalCacheActions<BalanceSheet>(BALANCE_SHEET_TAG_KEY)

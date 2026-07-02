import { endOfDay } from 'date-fns'
import useSWR from 'swr'

import type { BalanceSheet } from '@internal-types/balanceSheet'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export type GetBalanceSheetParams = {
  businessId: string
  effectiveDate: Date
}

const getBalanceSheet = getWithQuery<
  { data: BalanceSheet },
  GetBalanceSheetParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/balance-sheet`,
)

const fetchBalanceSheet = createKeyedFetcher(getBalanceSheet)

export const BALANCE_SHEET_TAG_KEY = '#balance-sheet'

const buildKey = createBuildKey<GetBalanceSheetParams>([BALANCE_SHEET_TAG_KEY])

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
    key => fetchBalanceSheet(key).then(({ data }) => data),
  )

  return new SWRQueryResult(response)
}

export const useBalanceSheetGlobalCacheActions = createResourceGlobalCacheActions<BalanceSheet>(BALANCE_SHEET_TAG_KEY)

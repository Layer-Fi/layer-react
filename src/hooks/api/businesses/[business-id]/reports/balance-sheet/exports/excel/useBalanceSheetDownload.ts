import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import type { GetBalanceSheetParams } from '@hooks/api/businesses/[business-id]/reports/balance-sheet/useBalanceSheet'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const getBalanceSheetExcel = get<
  { data: S3PresignedUrl },
  GetBalanceSheetParams
>(
  ({ businessId, effectiveDate }) => {
    const parameters = toDefinedSearchParameters({ effectiveDate })

    return `/v1/businesses/${businessId}/reports/balance-sheet/exports/excel?${parameters}`
  },
)

const DOWNLOAD_BALANCE_SHEET_TAG_KEY = '#download-balance-sheet'

const buildKey = createBuildKey<{ businessId: string, effectiveDate: Date }>([DOWNLOAD_BALANCE_SHEET_TAG_KEY])

type UseBalanceSheetOptions = {
  effectiveDate: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

export function useBalanceSheetDownload({
  effectiveDate,
  onSuccess,
}: UseBalanceSheetOptions) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      effectiveDate,
    })),
    ({ accessToken, apiUrl, businessId, effectiveDate }) => getBalanceSheetExcel(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          effectiveDate,
        },
      })().then(({ data }) => {
      if (onSuccess) {
        return onSuccess(data)
      }
    }),
    {
      revalidate: false,
      throwOnError: false,
    },
  )
}

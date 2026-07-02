import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import type { GetBalanceSheetParams } from '@hooks/api/businesses/[business-id]/reports/balance-sheet/useBalanceSheet'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const getBalanceSheetExcel = getWithQuery<
  { data: S3PresignedUrl },
  GetBalanceSheetParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/balance-sheet/exports/excel`,
)

const fetchBalanceSheetExcel = createKeyedFetcher(getBalanceSheetExcel)

const DOWNLOAD_BALANCE_SHEET_TAG_KEY = '#download-balance-sheet'

const buildKey = createBuildKey<GetBalanceSheetParams>([DOWNLOAD_BALANCE_SHEET_TAG_KEY])

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
    key => fetchBalanceSheetExcel(key).then(({ data }) => {
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

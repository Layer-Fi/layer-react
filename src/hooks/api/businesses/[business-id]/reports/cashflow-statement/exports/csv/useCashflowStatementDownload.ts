import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import type { GetStatementOfCashFlowParams } from '@hooks/api/businesses/[business-id]/reports/cashflow-statement/useStatementOfCashFlow'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const getCashflowStatementCSV = getWithQuery<
  { data: S3PresignedUrl },
  GetStatementOfCashFlowParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/cashflow-statement/exports/csv`,
)

const fetchCashflowStatementCSV = createKeyedFetcher(getCashflowStatementCSV)

const DOWNLOAD_CASHFLOW_STATEMENT_TAG_KEY = '#download-cashflow-statement'

const buildKey = createBuildKey<GetStatementOfCashFlowParams>([DOWNLOAD_CASHFLOW_STATEMENT_TAG_KEY])

type UseCashflowStatementDownloadOptions = {
  startDate: Date
  endDate: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

export function useCashflowStatementDownload({
  startDate,
  endDate,
  onSuccess,
}: UseCashflowStatementDownloadOptions) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      startDate,
      endDate,
    })),
    key => fetchCashflowStatementCSV(key).then(({ data }) => {
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

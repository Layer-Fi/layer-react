import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import type { GetStatementOfCashFlowParams } from '@hooks/api/businesses/[business-id]/reports/cashflow-statement/useStatementOfCashFlow'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const getCashflowStatementCSV = get<
  { data: S3PresignedUrl },
  GetStatementOfCashFlowParams
>(
  ({ businessId, startDate, endDate }) => {
    const parameters = toDefinedSearchParameters({ startDate, endDate })

    return `/v1/businesses/${businessId}/reports/cashflow-statement/exports/csv?${parameters}`
  },
)

const DOWNLOAD_CASHFLOW_STATEMENT_TAG_KEY = '#download-cashflow-statement'

const buildKey = createBuildKey<{ businessId: string, startDate: Date, endDate: Date }>([DOWNLOAD_CASHFLOW_STATEMENT_TAG_KEY])

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
    ({ accessToken, apiUrl, businessId, startDate, endDate }) => getCashflowStatementCSV(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          startDate,
          endDate,
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

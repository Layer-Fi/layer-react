import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type GetLedgerAccountBalancesCSVParams = {
  businessId: string
  startDate?: Date
  endDate?: Date
}

const getLedgerAccountBalancesCSV = get<{ data: S3PresignedUrl }, GetLedgerAccountBalancesCSVParams>(
  ({ businessId, startDate, endDate }) => {
    const parameters = toDefinedSearchParameters({ startDate, endDate })

    return `/v1/businesses/${businessId}/ledger/balances/exports/csv?${parameters}`
  },
)

const buildKey = createBuildKey<{ businessId: string, startDate?: Date, endDate?: Date }>(['#account-balances', '#exports', '#csv'])

type UseAccountBalancesDownloadOptions = {
  startDate?: Date
  endDate?: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

export function useAccountBalancesDownload({
  startDate,
  endDate,
  onSuccess,
}: UseAccountBalancesDownloadOptions) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      startDate,
      endDate,
    })),
    ({ accessToken, apiUrl, businessId, startDate, endDate }) => getLedgerAccountBalancesCSV(
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

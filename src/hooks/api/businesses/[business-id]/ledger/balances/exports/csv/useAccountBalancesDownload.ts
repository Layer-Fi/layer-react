import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const getLedgerAccountBalancesCSV = get<{ data: S3PresignedUrl }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/balances/exports/csv`,
)

const buildKey = createBuildKey<{ businessId: string, startCutoff?: Date, endCutoff?: Date }>(['#account-balances', '#exports', '#csv'])

type UseAccountBalancesDownloadOptions = {
  startCutoff?: Date
  endCutoff?: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

export function useAccountBalancesDownload({
  startCutoff,
  endCutoff,
  onSuccess,
}: UseAccountBalancesDownloadOptions) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      startCutoff,
      endCutoff,
    })),
    ({ accessToken, apiUrl, businessId, startCutoff, endCutoff }) => getLedgerAccountBalancesCSV(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          startCutoff: startCutoff?.toISOString(),
          endCutoff: endCutoff?.toISOString(),
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

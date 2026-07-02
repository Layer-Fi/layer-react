import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { getWithQuery } from '@utils/api/getWithQuery'
import type { MutationRequest } from '@utils/api/postAsQuery'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type GetAccountBalancesCSVParams = {
  businessId: string
  startDate?: Date
  endDate?: Date
}

const getLedgerAccountBalancesCSV = getWithQuery<
  { data: S3PresignedUrl },
  GetAccountBalancesCSVParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/balances/exports/csv`,
)

const requestLedgerAccountBalancesCSV: MutationRequest<
  { data: S3PresignedUrl },
  Record<string, unknown>,
  GetAccountBalancesCSVParams
> = (baseUrl, accessToken, options) =>
  getLedgerAccountBalancesCSV(baseUrl, accessToken, { params: options?.params })()

const useAccountBalancesDownloadMutation = createMutationHook({
  tags: ['#account-balances', '#exports', '#csv'],
  request: requestLedgerAccountBalancesCSV,
  keyParams: ['startDate', 'endDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})

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
  return useAccountBalancesDownloadMutation({
    startDate,
    endDate,
    swrOptions: { onSuccess },
  })
}

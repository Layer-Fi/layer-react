import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { get } from '@utils/api/authenticatedHttp'
import type { MutationRequest } from '@utils/api/postAsQuery'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type GetAccountBalancesCSVParams = {
  businessId: string
  startCutoff?: Date
  endCutoff?: Date
}

const getLedgerAccountBalancesCSV = get<
  { data: S3PresignedUrl },
  GetAccountBalancesCSVParams
>(({ businessId }) => `/v1/businesses/${businessId}/ledger/balances/exports/csv`)

const requestLedgerAccountBalancesCSV: MutationRequest<
  { data: S3PresignedUrl },
  Record<string, unknown>,
  GetAccountBalancesCSVParams
> = (baseUrl, accessToken, options) =>
  getLedgerAccountBalancesCSV(baseUrl, accessToken, { params: options?.params })()

const useAccountBalancesDownloadMutation = createMutationHook({
  tags: ['#account-balances', '#exports', '#csv'],
  request: requestLedgerAccountBalancesCSV,
  keyParams: ['startCutoff', 'endCutoff'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})

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
  return useAccountBalancesDownloadMutation({
    startCutoff,
    endCutoff,
    swrOptions: { onSuccess },
  })
}

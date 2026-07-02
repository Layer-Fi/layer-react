import type { S3PresignedUrl } from '@internal-types/general'
import { getWithQuery } from '@utils/api/getWithQuery'
import { getAsMutation } from '@utils/api/postAsQuery'
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

const requestLedgerAccountBalancesCSV = getAsMutation(getLedgerAccountBalancesCSV)

export const useAccountBalancesDownload = createMutationHook({
  tags: ['#account-balances', '#exports', '#csv'],
  request: requestLedgerAccountBalancesCSV,
  keyParams: ['startDate', 'endDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})

import useSWR from 'swr'

import { type BankTransaction, type BankTransactionMetadata } from '@internal-types/bankTransactions'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const getBankTransactionMetadata = get<{
  data: BankTransactionMetadata
  errors: unknown
}>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`,
)

export const GET_BANK_TRANSACTION_METADATA_TAG_KEY = '#bank-transaction-metadata'

const buildKey = createBuildKey<{ businessId: string, bankTransactionId: string }>([GET_BANK_TRANSACTION_METADATA_TAG_KEY])

export function useBankTransactionMetadata({ bankTransactionId }: { bankTransactionId: BankTransaction['id'] }) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      bankTransactionId,
    })),
    ({ accessToken, apiUrl, businessId }) => getBankTransactionMetadata(
      apiUrl,
      accessToken,
      { params: { businessId, bankTransactionId } },
    )().then(({ data }) => data),
  )
}

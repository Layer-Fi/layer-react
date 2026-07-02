import useSWR from 'swr'

import { type BankTransaction, type BankTransactionMetadata } from '@internal-types/bankTransactions'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher, type SWRKeyContext } from '@utils/swr/createKeyedFetcher'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type GetBankTransactionMetadataParams = {
  businessId: string
  bankTransactionId: string
}

const getBankTransactionMetadata = get<
  {
    data: BankTransactionMetadata
    errors: unknown
  },
  GetBankTransactionMetadataParams
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`,
)

const fetchBankTransactionMetadata = createKeyedFetcher(getBankTransactionMetadata)

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
    (key: SWRKeyContext & GetBankTransactionMetadataParams) =>
      fetchBankTransactionMetadata(key).then(({ data }) => data),
  )
}

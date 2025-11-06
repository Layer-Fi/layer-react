import useSWR from 'swr'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useAuth } from '@hooks/useAuth'
import { getBankTransactionMetadata } from '@api/layer/bankTransactions'
import { BankTransaction } from '@internal-types/bank_transactions'

export const GET_BANK_TRANSACTION_METADATA_TAG_KEY = '#bank-transaction-metadata'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  bankTransactionId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  bankTransactionId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      bankTransactionId,
      tags: [GET_BANK_TRANSACTION_METADATA_TAG_KEY],
    } as const
  }
}

export function useBankTransactionMetadata({ bankTransactionId }: { bankTransactionId: BankTransaction['id'] }) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      bankTransactionId,
    }),
    ({ accessToken, apiUrl, businessId }) => getBankTransactionMetadata(
      apiUrl,
      accessToken,
      { params: { businessId, bankTransactionId } },
    )().then(({ data }) => data),
  )
}

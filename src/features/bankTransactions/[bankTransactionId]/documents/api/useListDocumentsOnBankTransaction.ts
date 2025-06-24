import { useLayerContext } from '../../../../../contexts/LayerContext'
import { useAuth } from '../../../../../hooks/useAuth'
import { get } from '../../../../../api/layer/authenticated_http'
import useSWR from 'swr'
import { Schema } from 'effect'
import { S3PresignedUrlSchema } from '../documentSchemas'

const DocumentURLsSchema = Schema.Struct({
  documentUrls: Schema.Array(S3PresignedUrlSchema),
})

const LIST_DOCUMENTS_ON_BANK_TRANSACTION_TAG = '#list-documents-on-bank-transaction'

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
      tags: [LIST_DOCUMENTS_ON_BANK_TRANSACTION_TAG],
    }
  }
}

const listDocumentsOnBankTransaction = get<
  { data: unknown },
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/documents?content_disposition=ATTACHMENT`,
)

type UseListDocumentsOnBankTransactionParameters = {
  bankTransactionId: string
}

export function useListDocumentsOnBankTransaction({
  bankTransactionId,
}: UseListDocumentsOnBankTransactionParameters) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      bankTransactionId,
    }),
    (
      {
        accessToken,
        apiUrl,
        businessId,
        bankTransactionId,
      },
    ) => listDocumentsOnBankTransaction(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
        },
      },
    )()
      .then(({ data }) => Schema.decodeUnknownPromise(DocumentURLsSchema)(data))
      .then(({ documentUrls }) => documentUrls),
  )
}

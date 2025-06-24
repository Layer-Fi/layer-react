import { useCallback } from 'react'
import { useLayerContext } from '../../../../../contexts/LayerContext'
import useSWRMutation from 'swr/mutation'
import { useAuth } from '../../../../../hooks/useAuth'
import { useBankTransactionsInvalidator } from '../../../../../hooks/useBankTransactions/useBankTransactions'
import { post } from '../../../../../api/layer/authenticated_http'

const ARCHIVE_DOCUMENT_ON_BANK_TRANSACTION_TAG = '#archive-document-on-bank-transaction'

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
      tags: [ARCHIVE_DOCUMENT_ON_BANK_TRANSACTION_TAG],
    }
  }
}

const archiveDocumentOnBankTransaction = post<
  { data: never },
  Record<string, never>,
  {
    businessId: string
    bankTransactionId: string
    documentId: string
  }
>(
  ({ businessId, bankTransactionId, documentId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/documents/${documentId}/archive`,
)

type ArchiveDocumentOnBankTransactionArgs = {
  documentId: string
}

type UseArchiveDocumentOnBankTransactionParameters = {
  bankTransactionId: string
}

export function useArchiveDocumentOnBankTransaction({
  bankTransactionId,
}: UseArchiveDocumentOnBankTransactionParameters) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
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
      { arg: { documentId } }: { arg: ArchiveDocumentOnBankTransactionArgs },
    ) => archiveDocumentOnBankTransaction(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
          documentId,
        },
      },
    ).then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { invalidateBankTransactions } = useBankTransactionsInvalidator()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)

      return triggerResultPromise
        .finally(() => { void invalidateBankTransactions() })
    },
    [
      originalTrigger,
      invalidateBankTransactions,
    ],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}

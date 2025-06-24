import { useCallback } from 'react'
import { useLayerContext } from '../../../../../contexts/LayerContext'
import useSWRMutation from 'swr/mutation'
import { useAuth } from '../../../../../hooks/useAuth'
import { useBankTransactionsInvalidator } from '../../../../../hooks/useBankTransactions/useBankTransactions'
import { postWithFormData } from '../../../../../api/layer/authenticated_http'

const UPLOAD_BANK_TRANSACTION_DOCUMENT_TAG = '#upload-bank-transaction-document-tag'

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
      tags: [UPLOAD_BANK_TRANSACTION_DOCUMENT_TAG],
    }
  }
}

const uploadBankTransactionDocument = (
  baseUrl: string,
  accessToken: string,
  {
    params: {
      businessId,
      bankTransactionId,
    },
    body: {
      file,
      documentType,
    },
  }: {
    params: {
      businessId: string
      bankTransactionId: string
    }
    body: {
      file: File
      documentType: string
    }
  }) => {
  const formData = new FormData()

  formData.append('file', file)
  formData.append('documentType', documentType)

  const endpoint = `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/documents`

  return postWithFormData(
    endpoint,
    formData,
    baseUrl,
    accessToken,
  )
}

type UploadBankTransactionDocumentArgs = {
  file: File
  documentType: string
}

type UseUploadBankTransactionDocumentParameters = {
  bankTransactionId: string
}

export function useUploadBankTransactionDocument({
  bankTransactionId,
}: UseUploadBankTransactionDocumentParameters) {
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
      { arg: { file, documentType } }: { arg: UploadBankTransactionDocumentArgs },
    ) => uploadBankTransactionDocument(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
        },
        body: {
          file,
          documentType,
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

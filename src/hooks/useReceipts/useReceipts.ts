import { useEffect, useState } from 'react'
import { format as formatTime, parseISO } from 'date-fns'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { type Awaitable } from '@internal-types/utility/promises'
import { DATE_FORMAT } from '@config/general'
import { hasReceipts } from '@utils/bankTransactions'
import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { type DocumentWithStatus } from '@components/BankTransactionReceipts/BankTransactionReceipts'

export interface UseReceiptsProps {
  bankTransaction: BankTransaction
  isActive?: boolean
}

type UseReceipts = (props: UseReceiptsProps) => {
  receiptUrls: DocumentWithStatus[]
  uploadReceipt: (file: File) => Awaitable<void>
  archiveDocument: (document: DocumentWithStatus) => Awaitable<void>
}

const readDate = (date?: string) => {
  if (!date) return undefined
  return date && formatTime(parseISO(date), DATE_FORMAT)
}

export const useReceipts: UseReceipts = ({
  bankTransaction,
  isActive,
}: UseReceiptsProps) => {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  const { updateLocalBankTransactions } = useBankTransactionsContext()

  const [receiptUrls, setReceiptUrls] = useState<DocumentWithStatus[]>([])

  useEffect(() => {
    // Fetch documents details when the row is being opened and the documents are not yet loaded
    if (isActive && receiptUrls.length === 0 && hasReceipts(bankTransaction)) {
      void fetchDocuments()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const fetchDocuments = async () => {
    const listBankTransactionDocuments = Layer.listBankTransactionDocuments(
      apiUrl,
      auth?.access_token,
      {
        params: {
          businessId: businessId,
          bankTransactionId: bankTransaction.id,
        },
      },
    )
    const result = await listBankTransactionDocuments()
    const retrievedDocs = result.data.documentUrls.map(docUrl => ({
      id: docUrl.documentId,
      url: docUrl.presignedUrl,
      type: docUrl.fileType,
      status: 'uploaded' as const,
      name: docUrl.fileName,
      date: readDate(docUrl.createdAt),
    }))

    setReceiptUrls(retrievedDocs)
  }

  const uploadReceipt = async (file: File) => {
    const id = new Date().valueOf().toString()
    const receipts = [
      ...receiptUrls,
      {
        id,
        type: file.type,
        url: undefined,
        status: 'pending' as const,
        name: file.name,
        date: formatTime(parseISO(new Date().toISOString()), DATE_FORMAT),
      },
    ]
    try {
      setReceiptUrls(receipts)
      const uploadDocument = Layer.uploadBankTransactionDocument(
        apiUrl,
        auth?.access_token,
      )
      const result = await uploadDocument({
        businessId: businessId,
        bankTransactionId: bankTransaction.id,
        file: file,
        documentType: 'RECEIPT',
      })
      await fetchDocuments()
      // Update the bank transaction with the new document id
      if (
        updateLocalBankTransactions
        && result?.data?.id
        && bankTransaction?.document_ids
        && bankTransaction.document_ids.length === 0
      ) {
        updateLocalBankTransactions([{
          ...bankTransaction,
          document_ids: [result.data.id],
        }])
      }
    }
    catch (_err) {
      const newReceiptUrls = receipts.map((url) => {
        if (url.id === id) {
          return {
            ...url,
            error: 'Failed to upload',
            status: 'failed' as const,
          }
        }

        return url
      })
      setReceiptUrls(newReceiptUrls)
    }
  }

  const archiveDocument = async (document: DocumentWithStatus) => {
    if (!document.id) return

    try {
      if (document.error) {
        setReceiptUrls(receiptUrls.filter(url => url.id !== document.id))
      }
      else {
        setReceiptUrls(
          receiptUrls.map((url) => {
            if (url.id === document.id) {
              return {
                ...url,
                status: 'deleting',
              }
            }

            return url
          }),
        )
        await Layer.archiveBankTransactionDocument(apiUrl, auth?.access_token, {
          params: {
            businessId: businessId,
            bankTransactionId: bankTransaction.id,
            documentId: document.id,
          },
        })
        void fetchDocuments()
      }
    }
    catch (_err) {
      setReceiptUrls(
        receiptUrls.map((url) => {
          if (url.id === document.id) {
            return {
              ...url,
              status: 'failed',
              error: 'Failed to delete',
            }
          }

          return url
        }),
      )
    }
  }

  return {
    receiptUrls,
    uploadReceipt,
    archiveDocument,
  }
}

import { useEffect, useState } from 'react'
import { Layer } from '../../api/layer'
import { DocumentWithStatus } from '../../components/BankTransactionReceipts/BankTransactionReceipts'
import { DATE_FORMAT } from '../../config/general'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useLayerContext } from '../../contexts/LayerContext'
import { BankTransaction } from '../../types'
import { hasReceipts } from '../../utils/bankTransactions'
import { parseISO, format as formatTime } from 'date-fns'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'

export interface UseReceiptsProps {
  bankTransaction: BankTransaction
  isActive?: boolean
}

type UseReceipts = (props: UseReceiptsProps) => {
  receiptUrls: DocumentWithStatus[]
  uploadReceipt: (file: File) => void
  archiveDocument: (document: DocumentWithStatus) => void
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
  const { updateOneLocal: updateBankTransaction } = useBankTransactionsContext()

  const [receiptUrls, setReceiptUrls] = useState<DocumentWithStatus[]>([])

  useEffect(() => {
    // Fetch documents details when the row is being opened and the documents are not yet loaded
    if (isActive && receiptUrls.length === 0 && hasReceipts(bankTransaction)) {
      fetchDocuments()
    }
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
    const retrievedDocs = result.data.documentUrls.map((docUrl: any) => ({
      id: docUrl.documentId,
      url: docUrl.presignedUrl as string,
      type: docUrl.fileType as string | undefined,
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
        updateBankTransaction &&
        result?.data?.id &&
        bankTransaction?.document_ids &&
        bankTransaction.document_ids.length === 0
      ) {
        updateBankTransaction({
          ...bankTransaction,
          document_ids: [result.data.id],
        })
      }
    } catch (_err) {
      const newReceiptUrls = receipts.map(url => {
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
      } else {
        setReceiptUrls(
          receiptUrls.map(url => {
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
        fetchDocuments()
      }
    } catch (_err) {
      setReceiptUrls(
        receiptUrls.map(url => {
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

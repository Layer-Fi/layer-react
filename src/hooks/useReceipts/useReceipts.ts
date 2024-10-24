import { useEffect, useState } from 'react'
import { Layer } from '../../api/layer'
import { DocumentWithStatus } from '../../components/BankTransactionReceipts/BankTransactionReceipts'
import { DATE_FORMAT } from '../../config/general'
import { useLayerContext } from '../../contexts/LayerContext'
import { BankTransaction } from '../../types'
import { hasReceipts } from '../../utils/bankTransactions'
import { parseISO, format as formatTime } from 'date-fns'
import useSWR from 'swr'

export interface UseReceiptsProps {
  bankTransaction: BankTransaction
  isActive?: boolean
}

type UseReceipts = (props: UseReceiptsProps) => {
  receiptUrls: DocumentWithStatus[]
  uploadReceipt: (file: File) => void
  archiveDocument: (documentId: string) => void
}

const readDate = (date?: string) => {
  if (!date) return undefined
  return date && formatTime(parseISO(date), DATE_FORMAT)
}

export const useReceipts: UseReceipts = ({
  bankTransaction,
  isActive,
}: UseReceiptsProps) => {
  const { auth, businessId, apiUrl } = useLayerContext()

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
      auth.access_token,
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
        auth.access_token,
      )
      await uploadDocument({
        businessId: businessId,
        bankTransactionId: bankTransaction.id,
        file: file,
        documentType: 'RECEIPT',
      })
      await fetchDocuments()
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

  const archiveDocument = async (documentId: string) => {
    try {
      setReceiptUrls(
        receiptUrls.map(url => {
          if (url.id === documentId) {
            return {
              ...url,
              status: 'deleting',
            }
          }

          return url
        }),
      )
      await Layer.archiveBankTransactionDocument(apiUrl, auth.access_token, {
        params: {
          businessId: businessId,
          bankTransactionId: bankTransaction.id,
          documentId,
        },
      })
      fetchDocuments()
    } catch (_err) {
      setReceiptUrls(
        receiptUrls.map(url => {
          if (url.id === documentId) {
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

import { useEffect, useRef, useState } from 'react'
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

const RECEIPT_ALLOWED_UPLOAD_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/avif',
  'image/bmp',
  'application/pdf',
  '.pdf',
]

export const RECEIPT_ALLOWED_INPUT_FILE_TYPES = [...RECEIPT_ALLOWED_UPLOAD_FILE_TYPES].join(',')

const isValidReceiptFile = (file: File): boolean => {
  return RECEIPT_ALLOWED_UPLOAD_FILE_TYPES.includes(file.type)
}

const getUniqueFileName = (fileName: string, existingNames: string[]): string => {
  if (!existingNames.includes(fileName)) {
    return fileName
  }

  const lastDotIndex = fileName.lastIndexOf('.')
  const baseName = lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName
  const extension = lastDotIndex > 0 ? fileName.slice(lastDotIndex) : ''

  let counter = 2
  let newName = `${baseName} (${counter})${extension}`

  while (existingNames.includes(newName)) {
    counter++
    newName = `${baseName} (${counter})${extension}`
  }

  return newName
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
  const pendingUploadNamesRef = useRef<Set<string>>(new Set())

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
    if (!isValidReceiptFile(file)) {
      const id = new Date().valueOf().toString()
      setReceiptUrls(prev => [
        ...prev,
        {
          id,
          type: file.type,
          url: undefined,
          status: 'failed' as const,
          name: file.name,
          date: formatTime(parseISO(new Date().toISOString()), DATE_FORMAT),
          error: 'Invalid file type. Please upload an image or PDF.',
        },
      ])
      return
    }

    const existingNames = [
      ...receiptUrls
        .map(r => r.name)
        .filter((name): name is string => Boolean(name)),
      ...pendingUploadNamesRef.current,
    ]
    const uniqueName = getUniqueFileName(file.name, existingNames)
    const renamedFile = new File([file], uniqueName, { type: file.type })

    pendingUploadNamesRef.current.add(uniqueName)

    const id = new Date().valueOf().toString()
    const newReceipt = {
      id,
      type: renamedFile.type,
      url: undefined,
      status: 'pending' as const,
      name: renamedFile.name,
      date: formatTime(parseISO(new Date().toISOString()), DATE_FORMAT),
    }

    try {
      setReceiptUrls(prev => [...prev, newReceipt])
      const uploadDocument = Layer.uploadBankTransactionDocument(
        apiUrl,
        auth?.access_token,
      )
      const result = await uploadDocument({
        businessId: businessId,
        bankTransactionId: bankTransaction.id,
        file: renamedFile,
        documentType: 'RECEIPT',
      })
      pendingUploadNamesRef.current.delete(uniqueName)
      await fetchDocuments()
      // Update the bank transaction with the new document id
      if (
        result?.data?.id
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
      pendingUploadNamesRef.current.delete(uniqueName)
      setReceiptUrls(prev =>
        prev.map((url) => {
          if (url.id === id) {
            return {
              ...url,
              error: 'Failed to upload',
              status: 'failed' as const,
            }
          }

          return url
        }),
      )
    }
  }

  const archiveDocument = async (document: DocumentWithStatus) => {
    if (!document.id) return

    try {
      if (document.error) {
        setReceiptUrls(prev => prev.filter(url => url.id !== document.id))
      }
      else {
        setReceiptUrls(prev =>
          prev.map((url) => {
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
      setReceiptUrls(prev =>
        prev.map((url) => {
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

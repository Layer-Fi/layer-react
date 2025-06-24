import { forwardRef, useCallback, useImperativeHandle } from 'react'
import { BankTransaction } from '../../types'
import { FileThumb } from '../FileThumb'
import { FileInput } from '../Input'
import { Text, TextSize } from '../Typography'
import { useListDocumentsOnBankTransaction } from '../../features/bankTransactions/[bankTransactionId]/documents/api/useListDocumentsOnBankTransaction'
import { useUploadDocumentOnBankTransaction } from '../../features/bankTransactions/[bankTransactionId]/documents/api/useUploadDocumentOnBankTransaction'
import { useArchiveDocumentOnBankTransaction } from '../../features/bankTransactions/[bankTransactionId]/documents/api/useArchiveDocumentOnBankTransaction'
import { formatISO } from 'date-fns'

const MAX_RECEIPTS_COUNT = 10

export interface DocumentWithStatus {
  id?: string
  url?: string
  status: 'pending' | 'uploaded' | 'failed' | 'deleting'
  type?: string
  name?: string
  date?: string
  error?: string
}

export interface BankTransactionReceiptsProps {
  bankTransactionId: string
  classNamePrefix?: string
  floatingActions?: boolean
  hideUploadButtons?: boolean
  label?: string
}

export interface BankTransactionReceiptsWithProviderProps
  extends BankTransactionReceiptsProps {
  bankTransaction: BankTransaction
  isActive?: boolean
}

export interface BankTransactionReceiptsHandle {
  uploadReceipt: (file: File) => void
}

const openReceiptInNewTab =
  (url: string, index: number) =>
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault()
      const newWindow = window.open('', '_blank')

      if (newWindow) {
        newWindow.document.write(`
        <html>
          <head>
            <title>Receipt ${index + 1}</title>
          </head>
          <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
            <img src="${url}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
          </body>
        </html>
      `)
      }
    }

export const BankTransactionReceipts = forwardRef<
  BankTransactionReceiptsHandle,
  BankTransactionReceiptsProps
>(
  function BankTransactionReceipts(
    {
      bankTransactionId,
      classNamePrefix = 'Layer',
      floatingActions = false,
      hideUploadButtons = false,
      label,
    },
    ref,
  ) {
    const { data: documents } = useListDocumentsOnBankTransaction({ bankTransactionId })

    const { trigger: uploadDocument } = useUploadDocumentOnBankTransaction({ bankTransactionId })
    const { trigger: archiveDocument } = useArchiveDocumentOnBankTransaction({ bankTransactionId })

    const uploadReceipt = useCallback(
      (file: File) => {
        void uploadDocument({
          file,
          documentType: 'RECEIPT',
        })
      },
      [uploadDocument],
    )

    // Call this save action after clicking save in parent component:
    useImperativeHandle(ref, () => ({
      uploadReceipt,
    }))

    const hasDocuments = documents && documents.length > 0
    const documentCount = documents?.length ?? 0

    return (
      <div className={`${classNamePrefix}__file-upload`}>
        {hasDocuments && label
          ? (
            <Text size={TextSize.sm} className='Layer__file-upload__label'>
              {label}
            </Text>
          )
          : null}
        {!hideUploadButtons && (!hasDocuments)
          ? (
            <FileInput onUpload={files => void uploadReceipt(files[0])} text='Upload receipt' />
          )
          : null}
        {documents?.map(({ presignedUrl, fileType, fileName, createdAt, documentId }, index) => (
          <FileThumb
            key={index}
            url={presignedUrl}
            type={fileType}
            floatingActions={floatingActions}
            name={fileName || `Receipt ${index + 1}`}
            date={formatISO(createdAt)}
            enableOpen={fileType === 'application/pdf'}
            onOpen={
              presignedUrl && fileType && fileType.startsWith('image/')
                ? openReceiptInNewTab(presignedUrl, index)
                : undefined
            }
            enableDownload
            onDelete={() => {
              if (documentId) {
                void archiveDocument({ documentId })
              }
            }}
          />
        ))}
        {!hideUploadButtons
          && documentCount > 0
          && documentCount < MAX_RECEIPTS_COUNT
          ? (
            <FileInput
              secondary
              onUpload={files => void uploadReceipt(files[0])}
              text='Add next receipt'
            />
          )
          : null}
      </div>
    )
  },
)

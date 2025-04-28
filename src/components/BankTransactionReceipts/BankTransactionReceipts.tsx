import { forwardRef, useImperativeHandle } from 'react'
import { useReceiptsContext } from '../../contexts/ReceiptsContext/ReceiptsContext'
import { ReceiptsProvider } from '../../providers/ReceiptsProvider'
import { BankTransaction } from '../../types'
import { FileThumb } from '../FileThumb'
import { FileInput } from '../Input'
import { Text, TextSize } from '../Typography'

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

const BankTransactionReceiptsWithProvider = forwardRef<
  BankTransactionReceiptsHandle,
  BankTransactionReceiptsWithProviderProps
>(({ bankTransaction, isActive, ...props }, ref) => {
  return (
    <ReceiptsProvider bankTransaction={bankTransaction} isActive={isActive}>
      <BankTransactionReceipts {...props} ref={ref} />
    </ReceiptsProvider>
  )
})

BankTransactionReceiptsWithProvider.displayName =
  'BankTransactionReceiptsWithProvider'

export { BankTransactionReceiptsWithProvider }

const BankTransactionReceipts = forwardRef<
  BankTransactionReceiptsHandle,
  BankTransactionReceiptsProps
>(
  (
    {
      classNamePrefix = 'Layer',
      floatingActions = false,
      hideUploadButtons = false,
      label,
    },
    ref,
  ) => {
    const { receiptUrls, uploadReceipt, archiveDocument } = useReceiptsContext()

    // Call this save action after clicking save in parent component:
    useImperativeHandle(ref, () => ({
      uploadReceipt,
    }))

    return (
      <div className={`${classNamePrefix}__file-upload`}>
        {receiptUrls && receiptUrls.length > 0 && label
          ? (
            <Text size={TextSize.sm} className='Layer__file-upload__label'>
              {label}
            </Text>
          )
          : null}
        {!hideUploadButtons && (!receiptUrls || receiptUrls.length === 0)
          ? (
            <FileInput onUpload={files => void uploadReceipt(files[0])} text='Upload receipt' />
          )
          : null}
        {receiptUrls.map((url, index) => (
          <FileThumb
            key={index}
            url={url.url}
            type={url.type}
            floatingActions={floatingActions}
            uploadPending={url.status === 'pending'}
            deletePending={url.status === 'deleting'}
            name={url.name ?? `Receipt ${index + 1}`}
            date={url.date}
            enableOpen={url.type === 'application/pdf'}
            onOpen={
              url.url && url.type && url.type.startsWith('image/')
                ? openReceiptInNewTab(url.url, index)
                : undefined
            }
            enableDownload
            error={url.error}
            onDelete={() => url.id && void archiveDocument(url)}
          />
        ))}
        {!hideUploadButtons
        && receiptUrls.length > 0
        && receiptUrls.length < MAX_RECEIPTS_COUNT
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

BankTransactionReceipts.displayName = 'BankTransactionReceipts'

export { BankTransactionReceipts }

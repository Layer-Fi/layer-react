import React, { useEffect, useState } from 'react'
import { Layer } from '../../api/layer'
import { DATE_FORMAT } from '../../config/general'
import { useLayerContext } from '../../contexts/LayerContext'
import { BankTransaction } from '../../types'
import { FileThumb } from '../FileThumb'
import { FileInput } from '../Input'
import { parseISO, format as formatTime } from 'date-fns'

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
  isActive?: boolean // @TODO use isOpen
  bankTransaction: BankTransaction
  floatingActions?: boolean
}

// @TODO move to utils ?
const readDate = (date?: string) => {
  if (!date) return undefined
  return date && formatTime(parseISO(date), DATE_FORMAT)
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

export const BankTransactionReceipts = ({
  classNamePrefix = 'Layer',
  isActive,
  bankTransaction,
  floatingActions = false,
}: BankTransactionReceiptsProps) => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const [receiptUrls, setReceiptUrls] = useState<DocumentWithStatus[]>([])

  useEffect(() => {
    // Fetch documents details when the row is being opened and the documents are not yet loaded
    if (
      receiptUrls.length === 0 &&
      bankTransaction?.document_ids &&
      bankTransaction.document_ids.length > 0
    ) {
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

  const onReceiptUpload = async (file: File) => {
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

  return (
    <div className={`${classNamePrefix}__file-upload`}>
      {!receiptUrls || receiptUrls.length === 0 ? (
        <FileInput onUpload={onReceiptUpload} text='Upload receipt' />
      ) : null}
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
            url.url && url.type !== 'application/pdf'
              ? openReceiptInNewTab(url.url, index)
              : undefined
          }
          enableDownload
          error={url.error}
          onDelete={() => url.id && archiveDocument(url.id)}
        />
      ))}
      {receiptUrls.length > 0 && receiptUrls.length < 10 ? (
        <FileInput
          secondary
          onUpload={onReceiptUpload}
          text='Add next receipt'
        />
      ) : null}
    </div>
  )
}

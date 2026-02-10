import { useCallback, useState } from 'react'

import { useInvoicePreviewRoute } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useInvoicePreview } from '@features/invoices/api/useInvoicePreview'

import './invoicePreview.scss'

const INVOICE_PREVIEW_SCALE = 0.8

export const InvoicePreview = () => {
  const { invoice } = useInvoicePreviewRoute()
  const { data: srcDoc } = useInvoicePreview({ invoiceId: invoice.id })
  const [previewHeight, setPreviewHeight] = useState<number | null>(null)

  const getDocumentHeight = useCallback((doc: Document) => {
    return Math.max(
      doc.body.scrollHeight,
      doc.documentElement.scrollHeight,
    )
  }, [])

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget
    const doc = iframe.contentDocument

    if (!doc) return

    const height = getDocumentHeight(doc)
    setPreviewHeight(height)
  }, [getDocumentHeight])

  if (!srcDoc) return null

  return (
    <div className='Layer__InvoicePreview__Container'>
      <div
        className='Layer__InvoicePreview__Inner'
        style={{ height: previewHeight ? `${previewHeight * INVOICE_PREVIEW_SCALE}px` : undefined }}
      >
        <iframe
          className='Layer__InvoicePreview__IFrame'
          srcDoc={srcDoc}
          sandbox='allow-same-origin'
          referrerPolicy='no-referrer'
          onLoad={handleLoad}
          height={previewHeight || undefined}
        />
      </div>
    </div>
  )
}

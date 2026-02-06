import { useCallback, useState } from 'react'

import { useInvoicePreviewRoute } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useInvoicePreview } from '@features/invoices/api/useInvoicePreview'

import './invoicePreview.scss'

export const InvoicePreview = () => {
  const { invoice } = useInvoicePreviewRoute()
  const { data: srcDoc } = useInvoicePreview({ invoiceId: invoice.id })
  const [height, setHeight] = useState<number | undefined>(undefined)
  const scaledHeight = height ? (height * 0.8) : undefined

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget
    const doc = iframe.contentDocument
    if (doc) {
      setHeight(doc.body.scrollHeight)
    }
  }, [])

  if (!srcDoc) return null

  return (
    <div className='Layer__InvoicePreview__Container'>
      <div
        className='Layer__InvoicePreview__Inner'
        style={{ height: scaledHeight ? `${scaledHeight}px` : undefined }}
      >
        <iframe
          className='Layer__InvoicePreview__IFrame'
          srcDoc={srcDoc}
          onLoad={handleLoad}
          style={{ height: height ? `${height}px` : undefined }}
        />
      </div>
    </div>
  )
}

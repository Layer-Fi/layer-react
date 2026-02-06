import { useCallback, useState } from 'react'

import { useInvoicePreviewRoute } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { HStack } from '@ui/Stack/Stack'
import { useInvoicePreview } from '@features/invoices/api/useInvoicePreview'

import './invoicePreview.scss'

export const InvoicePreview = () => {
  const { invoice } = useInvoicePreviewRoute()
  const { data: srcDoc } = useInvoicePreview({ invoiceId: invoice.id })
  const [height, setHeight] = useState<number | undefined>(undefined)

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget
    const doc = iframe.contentDocument
    if (doc) {
      setHeight(doc.body.scrollHeight)
    }
  }, [])

  if (!srcDoc) return null

  const noScrollStyle = '<style>html, body { overflow: hidden !important; }</style>'
  const modifiedSrcDoc = srcDoc.replace('</head>', `${noScrollStyle}</head>`)
  const scaledHeight = height ? (height * 0.8) : undefined

  return (
    <HStack pb='lg' pi='lg'>
      <div className='Layer__InvoicePreview__Container'>
        <div
          className='Layer__InvoicePreview__Inner'
          style={{ height: scaledHeight ? `${scaledHeight}px` : undefined }}
        >
          <iframe
            className='Layer__InvoicePreview__IFrame'
            srcDoc={modifiedSrcDoc}
            onLoad={handleLoad}
            style={{ height: height ? `${height}px` : undefined }}
          />
        </div>
      </div>
    </HStack>
  )
}

import { useCallback, useRef } from 'react'

import { useInvoicePreviewRoute } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { useInvoicePreview } from '@features/invoices/api/useInvoicePreview'

import './invoicePreview.scss'

export const InvoicePreview = () => {
  const { invoice } = useInvoicePreviewRoute()
  const { data: srcDoc } = useInvoicePreview({ invoiceId: invoice.id })
  const innerRef = useRef<HTMLDivElement>(null)

  const getDocumentHeight = useCallback((doc: Document) => {
    const { body, documentElement } = doc

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      documentElement.clientHeight,
      documentElement.scrollHeight,
      documentElement.offsetHeight,
    )
  }, [])

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget
    const doc = iframe.contentDocument

    if (!doc || !innerRef.current) return

    const height = getDocumentHeight(doc)

    iframe.style.height = `${height}px`
    innerRef.current.style.height = `${height * 0.8}px`
  }, [getDocumentHeight])

  if (!srcDoc) return null

  return (
    <HStack pb='lg' pi='lg'>
      <VStack className='Layer__InvoicePreview__Container'>
        <VStack
          className='Layer__InvoicePreview__Inner'
          ref={innerRef}
        >
          <iframe
            className='Layer__InvoicePreview__IFrame'
            srcDoc={srcDoc}
            sandbox='allow-same-origin'
            referrerPolicy='no-referrer'
            onLoad={handleLoad}
          />
        </VStack>
      </VStack>
    </HStack>
  )
}

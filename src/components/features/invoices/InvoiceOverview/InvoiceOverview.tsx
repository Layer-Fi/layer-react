import { VStack } from '@ui/Stack/Stack'
import { InvoiceSummaryStats } from '@features/invoices/InvoiceSummaryStats/InvoiceSummaryStats'
import { ResponsiveInvoiceView } from '@features/invoices/ResponsiveInvoiceView/ResponsiveInvoiceView'
import { StripeConnectBanner } from '@features/invoices/StripeConnectBanner/StripeConnectBanner'

import './invoiceOverview.scss'

export const InvoiceOverview = () => {
  return (
    <VStack gap='md' className='Layer__InvoiceOverview'>
      <VStack gap='md'>
        <InvoiceSummaryStats />
        <StripeConnectBanner />
      </VStack>
      <ResponsiveInvoiceView />
    </VStack>
  )
}

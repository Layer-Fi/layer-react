import { VStack } from '@ui/Stack/Stack'
import { InvoiceSummaryStats } from '@components/Invoices/InvoiceSummaryStats/InvoiceSummaryStats'
import { ResponsiveInvoiceView } from '@components/Invoices/InvoiceTable/ResponsiveInvoiceView'
import { StripeConnectBanner } from '@components/Invoices/StripeConnectBanner/StripeConnectBanner'

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

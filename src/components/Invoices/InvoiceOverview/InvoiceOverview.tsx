import { VStack } from '@ui/Stack/Stack'
import { InvoiceSummaryStats } from '@components/Invoices/InvoiceSummaryStats/InvoiceSummaryStats'
import { ResponsiveInvoiceView } from '@components/Invoices/InvoiceTable/ResponsiveInvoiceView'
import { StripeConnectBanner } from '@components/Invoices/StripeConnectBanner/StripeConnectBanner'

export const InvoiceOverview = () => {
  return (
    <VStack>
      <InvoiceSummaryStats />
      <StripeConnectBanner />
      <ResponsiveInvoiceView />
    </VStack>
  )
}

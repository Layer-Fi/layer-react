import { VStack } from '@ui/Stack/Stack'
import { InvoiceSummaryStats } from '@components/Invoices/InvoiceSummaryStats/InvoiceSummaryStats'
import { InvoiceTable } from '@components/Invoices/InvoiceTable/InvoiceTable'
import { StripeConnectBanner } from '@components/Invoices/StripeConnectBanner/StripeConnectBanner'

export const InvoiceOverview = () => {
  return (
    <VStack>
      <InvoiceSummaryStats />
      <StripeConnectBanner />
      <InvoiceTable />
    </VStack>
  )
}

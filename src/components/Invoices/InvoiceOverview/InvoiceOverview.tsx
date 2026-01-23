import { VStack } from '@ui/Stack/Stack'
import { InvoiceSummaryStats } from '@components/Invoices/InvoiceSummaryStats/InvoiceSummaryStats'
import { InvoiceTable } from '@components/Invoices/InvoiceTable/InvoiceTable'
import { StripeConnectBanner } from '@components/Invoices/StripeConnectBanner/StripeConnectBanner'

interface InvoiceOverviewProps {
  _showStripeConnectBanner: boolean
}

export const InvoiceOverview = ({ _showStripeConnectBanner }: InvoiceOverviewProps) => {
  return (
    <VStack>
      <InvoiceSummaryStats />
      {_showStripeConnectBanner && <StripeConnectBanner />}
      <InvoiceTable />
    </VStack>
  )
}

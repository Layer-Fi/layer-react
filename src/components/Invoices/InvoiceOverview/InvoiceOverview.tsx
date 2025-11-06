import { VStack } from '@ui/Stack/Stack'
import { InvoiceTable } from '@components/Invoices/InvoiceTable/InvoiceTable'
import { InvoiceSummaryStats } from '@components/Invoices/InvoiceSummaryStats/InvoiceSummaryStats'

export const InvoiceOverview = () => {
  return (
    <VStack>
      <InvoiceSummaryStats />
      <InvoiceTable />
    </VStack>
  )
}

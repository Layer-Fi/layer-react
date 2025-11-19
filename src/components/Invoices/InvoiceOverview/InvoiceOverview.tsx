import { VStack } from '@ui/Stack/Stack'
import { InvoiceSummaryStats } from '@components/Invoices/InvoiceSummaryStats/InvoiceSummaryStats'
import { InvoiceTable } from '@components/Invoices/InvoiceTable/InvoiceTable'

export const InvoiceOverview = () => {
  return (
    <VStack>
      <InvoiceSummaryStats />
      <InvoiceTable />
    </VStack>
  )
}

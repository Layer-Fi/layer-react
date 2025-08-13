import { VStack } from '../../ui/Stack/Stack'
import { InvoiceTable } from '../InvoiceTable/InvoiceTable'
import { InvoiceSummaryStats } from '../InvoiceSummaryStats/InvoiceSummaryStats'

export const InvoiceOverview = () => {
  return (
    <VStack>
      <InvoiceSummaryStats />
      <InvoiceTable />
    </VStack>
  )
}

import { VStack } from '../../ui/Stack/Stack'
import { InvoicesTable } from '../InvoicesTable/InvoicesTable'
import { InvoiceSummaryStats } from '../InvoiceSummaryStats/InvoiceSummaryStats'

export const InvoiceOverview = () => {
  return (
    <VStack>
      <InvoiceSummaryStats />
      <InvoicesTable />
    </VStack>
  )
}

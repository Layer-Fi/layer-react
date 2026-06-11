import { InvoiceOwedSummary } from '@components/Invoices/InvoiceSummaryStats/InvoiceOwedSummary'
import { InvoicePaymentsSummary } from '@components/Invoices/InvoiceSummaryStats/InvoicePaymentsSummary'

import './invoiceSummaryStats.scss'

export const InvoiceSummaryStats = () => {
  return (
    <div className='Layer__InvoiceSummaryStats__Container'>
      <InvoicePaymentsSummary />
      <InvoiceOwedSummary />
    </div>
  )
}

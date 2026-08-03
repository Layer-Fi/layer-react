import { InvoiceOwedSummary } from '@features/invoices/InvoiceSummaryStats/InvoiceOwedSummary'
import { InvoicePaymentsSummary } from '@features/invoices/InvoiceSummaryStats/InvoicePaymentsSummary'

import './invoiceSummaryStats.scss'

export const InvoiceSummaryStats = () => {
  return (
    <div className='Layer__InvoiceSummaryStats__Container'>
      <InvoicePaymentsSummary />
      <InvoiceOwedSummary />
    </div>
  )
}

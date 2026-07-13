import { useTranslation } from 'react-i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { getCustomerName } from '@utils/customerVendor'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './invoicesMobileListItem.scss'

export const InvoicesMobileListItem = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation()
  const { formatDate, formatCurrencyFromCents } = useIntlFormatter()

  const isPartiallyPaid = invoice.status === InvoiceStatus.PartiallyPaid

  return (
    <HStack justify='space-between' gap='sm' className='Layer__InvoicesMobileListItem'>
      <VStack gap='3xs' className='Layer__InvoicesMobileListItem__Identity'>
        <Span weight='bold' ellipsis>{invoice.invoiceNumber}</Span>
        <Span size='sm' ellipsis>{getCustomerName(invoice.customer)}</Span>
        {invoice.sentAt && <Span variant='subtle' size='sm'>{formatDate(invoice.sentAt)}</Span>}
      </VStack>

      <VStack gap='3xs' align='end' className='Layer__InvoicesMobileListItem__Amount'>
        <Span weight='bold' numeric='tabular-nums'>{formatCurrencyFromCents(invoice.totalAmount)}</Span>
        {isPartiallyPaid && (
          <Span variant='subtle' size='sm' numeric='tabular-nums'>
            {t('invoices:label.amount_outstanding', '{{amount}} outstanding', {
              amount: formatCurrencyFromCents(invoice.outstandingBalance),
            })}
          </Span>
        )}
      </VStack>
    </HStack>
  )
}

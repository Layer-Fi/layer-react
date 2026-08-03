import { useTranslation } from 'react-i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { getCustomerName } from '@utils/customer'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { MobileListItemContent } from '@blocks/MobileList/MobileListItemContent'

const InvoicesMobileListItemAmount = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()

  const isPartiallyPaid = invoice.status === InvoiceStatus.PartiallyPaid

  return (
    <VStack gap='3xs' align='end'>
      <Span weight='bold' numeric='tabular-nums'>{formatCurrencyFromCents(invoice.totalAmount)}</Span>
      {isPartiallyPaid && (
        <Span variant='subtle' size='sm' numeric='tabular-nums'>
          {t('invoices:label.amount_outstanding', '{{amount}} outstanding', {
            amount: formatCurrencyFromCents(invoice.outstandingBalance),
          })}
        </Span>
      )}
    </VStack>
  )
}

export const InvoicesMobileListItem = ({ invoice }: { invoice: Invoice }) => {
  const { formatDate } = useIntlFormatter()

  return (
    <MobileListItemContent
      title={invoice.invoiceNumber ?? ''}
      slots={{ Value: <InvoicesMobileListItemAmount invoice={invoice} /> }}
    >
      <Span size='sm' ellipsis>{getCustomerName(invoice.customer)}</Span>
      {invoice.sentAt && <Span variant='subtle' size='sm'>{formatDate(invoice.sentAt)}</Span>}
    </MobileListItemContent>
  )
}

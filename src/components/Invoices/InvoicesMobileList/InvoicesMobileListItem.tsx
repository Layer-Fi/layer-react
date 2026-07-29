import { useTranslation } from 'react-i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { getCustomerName } from '@utils/customer'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { MobileListItemContent } from '@ui/MobileList/MobileListItemContent'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

export const InvoicesMobileListItem = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation()
  const { formatDate, formatCurrencyFromCents } = useIntlFormatter()

  const isPartiallyPaid = invoice.status === InvoiceStatus.PartiallyPaid

  return (
    <MobileListItemContent
      title={invoice.invoiceNumber ?? ''}
      value={(
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
      )}
    >
      <Span size='sm' ellipsis>{getCustomerName(invoice.customer)}</Span>
      {invoice.sentAt && <Span variant='subtle' size='sm'>{formatDate(invoice.sentAt)}</Span>}
    </MobileListItemContent>
  )
}

import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/features/invoices/invoice'
import { InvoiceStatus } from '@schemas/features/invoices/invoiceStatus'
import { getCustomerName } from '@utils/features/customerVendor/customer'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { MobileListItemContent } from '@blocks/MobileList/MobileListItemContent'

/* Invoice-specific, so the shared content receives these rather than emitting them for every list. */
const legacyClassNames = createLegacyClassNames({
  'item:amount': 'Layer__InvoicesMobileListItem__Amount',
  'item:root': 'Layer__InvoicesMobileListItem',
})

const InvoicesMobileListItemAmount = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()

  const isPartiallyPaid = invoice.status === InvoiceStatus.PartiallyPaid

  return (
    <VStack gap='3xs' align='end' className={legacyClassNames('item:amount')}>
      <Span weight='bold' numeric='tabular-nums'>{formatCurrencyFromCents(invoice.totalAmount)}</Span>
      {isPartiallyPaid && (
        <Span variant='subtle' size='sm' numeric='tabular-nums'>
          {t('invoices:InvoicesMobileList.InvoicesMobileListItem.label.amount_outstanding', '{{amount}} outstanding', {
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
      legacyClassNames={{ root: legacyClassNames('item:root') }}
    >
      <Span size='sm' ellipsis>{getCustomerName(invoice.customer)}</Span>
      {invoice.sentAt && <Span variant='subtle' size='sm'>{formatDate(invoice.sentAt)}</Span>}
    </MobileListItemContent>
  )
}

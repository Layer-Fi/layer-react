import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { DataPoint } from '@components/DataPoint/DataPoint'
import { InvoiceStatusCell } from '@components/Invoices/InvoiceStatusCell/InvoiceStatusCell'

import './invoiceDetailSubHeader.scss'

export type InvoiceDetailSubHeaderProps = {
  invoice: Invoice
}

export const InvoiceDetailSubHeader = ({ invoice }: InvoiceDetailSubHeaderProps) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { outstandingBalance, totalAmount } = invoice

  return (
    <HStack className='Layer__InvoiceDetail__SubHeader'>
      <HStack gap='5xl'>
        <DataPoint label={t('invoices:label.balance_due', 'Balance due')}>
          <Span>{formatCurrencyFromCents(outstandingBalance)}</Span>
        </DataPoint>
        <DataPoint label={t('invoices:label.open_balance', 'Open balance')}>
          <Span>{formatCurrencyFromCents(totalAmount)}</Span>
        </DataPoint>
        <DataPoint label={t('common:label.status', 'Status')}>
          <InvoiceStatusCell invoice={invoice} inline />
        </DataPoint>
      </HStack>
    </HStack>
  )
}

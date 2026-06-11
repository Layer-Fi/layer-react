import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { getInvoiceStatusComponents } from '@components/Invoices/utils/invoiceStatusComponents'

import './invoicesMobileListItemStatusFooter.scss'

export const InvoicesMobileListItemStatusFooter = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  const status = getInvoiceStatusComponents(invoice, t, formatNumber)
  const StatusFooter__Icon = status.Icon

  return (
    <HStack
      align='center'
      justify='space-between'
      className='Layer__InvoicesMobileListItem__StatusFooter'
      data-status-variant={status.variant}
    >
      <HStack align='center' gap='2xs'>
        {StatusFooter__Icon
          ? <StatusFooter__Icon size={14} className='Layer__InvoicesMobileListItem__StatusFooter__Icon' />
          : <span className='Layer__InvoicesMobileListItem__StatusFooter__Dot' />}
        <Span weight='bold' size='sm'>
          {status.text}
        </Span>
      </HStack>
      {status.subText && (
        <Span variant='subtle' size='sm'>
          {status.subText}
        </Span>
      )}
    </HStack>
  )
}

import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { MobileListItemStatusFooter } from '@ui/MobileList/MobileListItemStatusFooter'
import { getInvoiceStatusComponents } from '@components/Invoices/utils/invoiceStatusComponents'

export const InvoicesMobileListItemStatusFooter = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  const { variant, text, subText, Icon } = getInvoiceStatusComponents(invoice, t, formatNumber)

  return (
    <MobileListItemStatusFooter
      variant={variant}
      text={text}
      subText={subText}
      slots={{ Icon }}
    />
  )
}

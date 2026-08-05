import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/features/invoices/invoice'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { MobileListItemStatusFooter } from '@blocks/MobileList/MobileListItemStatusFooter'
import { getInvoiceStatusDisplay } from '@features/invoices/utils'

export const InvoicesMobileListItemStatusFooter = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  const { variant, text, subText, Icon } = getInvoiceStatusDisplay(invoice, t, formatNumber)

  return (
    <MobileListItemStatusFooter
      variant={variant}
      text={text}
      subText={subText}
      slots={{ Icon }}
    />
  )
}

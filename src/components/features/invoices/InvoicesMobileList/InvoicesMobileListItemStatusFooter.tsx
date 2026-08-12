import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/features/invoices/invoice'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { MobileListItemStatusFooter } from '@blocks/MobileList/MobileListItemStatusFooter'
import { getInvoiceStatusDisplay } from '@features/invoices/utils'

/* Invoice-specific, so the shared footer receives these rather than emitting them for every list. */
const legacyClassNames = createLegacyClassNames({
  'footer:root': 'Layer__InvoicesMobileListItem__StatusFooter',
  'footer:icon': 'Layer__InvoicesMobileListItem__StatusFooter__Icon',
  'footer:dot': 'Layer__InvoicesMobileListItem__StatusFooter__Dot',
})

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
      legacyClassNames={{
        root: legacyClassNames('footer:root'),
        icon: legacyClassNames('footer:icon'),
        dot: legacyClassNames('footer:dot'),
      }}
    />
  )
}

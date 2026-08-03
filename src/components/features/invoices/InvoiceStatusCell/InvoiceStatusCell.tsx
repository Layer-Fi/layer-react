import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { InvoiceStatusBadge } from '@features/invoices/InvoiceStatusBadge/InvoiceStatusBadge'
import { getInvoiceStatusDisplay } from '@features/invoices/utils'

export const InvoiceStatusCell = ({ invoice, inline = false }: { invoice: Invoice, inline?: boolean }) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const status = getInvoiceStatusDisplay(invoice, t, formatNumber)

  const Stack = inline ? HStack : VStack
  const subText = (inline && status.subText) ? `(${status.subText})` : status.subText

  return (
    <HStack gap='xs' align='center'>
      <InvoiceStatusBadge status={status} inline={inline} />
      <Stack {...(inline && { gap: '3xs', align: 'center' })}>
        <Span>{status.text}</Span>
        {subText && <Span variant='subtle' size='sm'>{subText}</Span>}
      </Stack>
    </HStack>
  )
}

import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { tPlural } from '@utils/i18n/plural'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { getDueDifference } from '@utils/time/timeUtils'
import AlertCircle from '@icons/AlertCircle'
import CheckCircle from '@icons/CheckCircle'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'

const getDueStatusConfig = (invoice: Invoice, { inline }: { inline: boolean }, t: TFunction) => {
  const badgeSize = inline ? BadgeSize.EXTRA_SMALL : BadgeSize.SMALL
  const iconSize = inline ? 10 : 12

  switch (invoice.status) {
    case InvoiceStatus.WrittenOff: {
      return { text: t('invoices:state.written_off', 'Written Off') }
    }
    case InvoiceStatus.PartiallyWrittenOff: {
      return { text: t('invoices:state.partially_written_off', 'Partially Written Off') }
    }
    case InvoiceStatus.Refunded: {
      return { text: t('invoices:state.refunded', 'Refunded') }
    }
    case InvoiceStatus.Paid: {
      return {
        text: t('invoices:state.paid', 'Paid'),
        badge: <Badge variant={BadgeVariant.SUCCESS} size={badgeSize} icon={<CheckCircle size={iconSize} />} iconOnly />,
      }
    }
    case InvoiceStatus.Voided: {
      return { text: t('invoices:state.voided', 'Voided') }
    }
    case InvoiceStatus.Sent:
    case InvoiceStatus.PartiallyPaid: {
      if (invoice.dueAt === null) {
        return {
          text: invoice.status === InvoiceStatus.PartiallyPaid
            ? t('invoices:state.partially_paid', 'Partially Paid')
            : t('invoices:state.sent', 'Sent'),
        }
      }

      const dueDifference = getDueDifference(invoice.dueAt)
      if (dueDifference === 0) {
        return {
          text: t('invoices:state.due_today', 'Due Today'),
        }
      }

      if (dueDifference < 0) {
        const daysAgo = Math.abs(dueDifference)
        return {
          text: t('invoices:state.overdue', 'Overdue'),
          subText: tPlural(t, 'invoices:state.due_count_days_ago', {
            count: daysAgo,
            one: 'Due {{count}} day ago',
            other: 'Due {{count}} days ago',
          }),
          badge: <Badge variant={BadgeVariant.WARNING} size={badgeSize} icon={<AlertCircle size={iconSize} />} iconOnly />,
        }
      }

      const daysUntilDue = Math.abs(dueDifference)
      return {
        text: t('invoices:state.sent', 'Sent'),
        subText: tPlural(t, 'invoices:state.due_in_count_days', {
          count: daysUntilDue,
          one: 'Due in {{count}} day',
          other: 'Due in {{count}} days',
        }),
      }
    }
    default: {
      unsafeAssertUnreachable({
        value: invoice.status,
        message: 'Unexpected invoice status',
      })
    }
  }
}

export const InvoiceStatusCell = ({ invoice, inline = false }: { invoice: Invoice, inline?: boolean }) => {
  const { t } = useTranslation()
  const dueStatus = getDueStatusConfig(invoice, { inline }, t)

  const Stack = inline ? HStack : VStack
  const subText = (inline && dueStatus.subText) ? `(${dueStatus.subText})` : dueStatus.subText

  return (
    <HStack gap='xs' align='center'>
      {dueStatus.badge}
      <Stack {...(inline && { gap: '3xs', align: 'center' })}>
        <Span>{dueStatus.text}</Span>
        {subText && <Span variant='subtle' size='sm'>{subText}</Span>}
      </Stack>
    </HStack>
  )
}

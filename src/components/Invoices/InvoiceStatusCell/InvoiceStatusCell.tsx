import i18next from 'i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { i18nextPlural } from '@utils/i18n/plural'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { getDueDifference } from '@utils/time/timeUtils'
import AlertCircle from '@icons/AlertCircle'
import CheckCircle from '@icons/CheckCircle'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'

const getDueStatusConfig = (invoice: Invoice, { inline }: { inline: boolean }) => {
  const badgeSize = inline ? BadgeSize.EXTRA_SMALL : BadgeSize.SMALL
  const iconSize = inline ? 10 : 12

  switch (invoice.status) {
    case InvoiceStatus.WrittenOff: {
      return { text: i18next.t('writtenOff', 'Written Off') }
    }
    case InvoiceStatus.PartiallyWrittenOff: {
      return { text: i18next.t('partiallyWrittenOff', 'Partially Written Off') }
    }
    case InvoiceStatus.Refunded: {
      return { text: i18next.t('refunded', 'Refunded') }
    }
    case InvoiceStatus.Paid: {
      return {
        text: i18next.t('paid', 'Paid'),
        badge: <Badge variant={BadgeVariant.SUCCESS} size={badgeSize} icon={<CheckCircle size={iconSize} />} iconOnly />,
      }
    }
    case InvoiceStatus.Voided: {
      return { text: i18next.t('voided', 'Voided') }
    }
    case InvoiceStatus.Sent:
    case InvoiceStatus.PartiallyPaid: {
      if (invoice.dueAt === null) {
        return {
          text: invoice.status === InvoiceStatus.PartiallyPaid
            ? i18next.t('partiallyPaid', 'Partially Paid')
            : i18next.t('sent', 'Sent'),
        }
      }

      const dueDifference = getDueDifference(invoice.dueAt)
      if (dueDifference === 0) {
        return {
          text: i18next.t('dueTodayStatus', 'Due Today'),
        }
      }

      if (dueDifference < 0) {
        const daysAgo = Math.abs(dueDifference)
        return {
          text: i18next.t('overdue', 'Overdue'),
          subText: i18nextPlural('dueCountDaysAgo', {
            count: daysAgo,
            one: 'Due {{count}} day ago',
            other: 'Due {{count}} days ago',
          }),
          badge: <Badge variant={BadgeVariant.WARNING} size={badgeSize} icon={<AlertCircle size={iconSize} />} iconOnly />,
        }
      }

      const daysUntilDue = Math.abs(dueDifference)
      return {
        text: i18next.t('sent', 'Sent'),
        subText: i18nextPlural('dueInCountDays', {
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
  const dueStatus = getDueStatusConfig(invoice, { inline })

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

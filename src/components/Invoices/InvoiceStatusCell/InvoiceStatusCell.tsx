import { type Invoice, InvoiceStatus } from '../../../features/invoices/invoiceSchemas'
import { unsafeAssertUnreachable } from '../../../utils/switch/assertUnreachable'
import { Badge, BadgeVariant, BadgeSize } from '../../Badge/Badge'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { Span } from '../../ui/Typography/Text'
import { getDueDifference } from '../../../utils/time/timeUtils'
import pluralize from 'pluralize'
import AlertCircle from '../../../icons/AlertCircle'
import CheckCircle from '../../../icons/CheckCircle'

const getDueStatusConfig = (invoice: Invoice, { inline }: { inline: boolean }) => {
  const badgeSize = inline ? BadgeSize.EXTRA_SMALL : BadgeSize.SMALL
  const iconSize = inline ? 10 : 12

  switch (invoice.status) {
    case InvoiceStatus.WrittenOff: {
      return { text: 'Written Off' }
    }
    case InvoiceStatus.PartiallyWrittenOff: {
      return { text: 'Partially Written Off' }
    }
    case InvoiceStatus.Paid: {
      return {
        text: 'Paid',
        badge: <Badge variant={BadgeVariant.SUCCESS} size={badgeSize} icon={<CheckCircle size={iconSize} />} iconOnly />,
      }
    }
    case InvoiceStatus.Voided: {
      return { text: 'Voided' }
    }
    case InvoiceStatus.Sent:
    case InvoiceStatus.PartiallyPaid: {
      if (invoice.dueAt === null) {
        return {
          text: invoice.status === InvoiceStatus.PartiallyPaid ? 'Partially Paid' : 'Sent',
        }
      }

      const dueDifference = getDueDifference(invoice.dueAt)
      if (dueDifference === 0) {
        return {
          text: 'Due Today',
        }
      }

      if (dueDifference < 0) {
        return {
          text: 'Overdue',
          subText: `Due ${pluralize('day', Math.abs(dueDifference), true)} ago`,
          badge: <Badge variant={BadgeVariant.WARNING} size={badgeSize} icon={<AlertCircle size={iconSize} />} iconOnly />,
        }
      }

      return {
        text: 'Sent',
        subText: `Due in ${pluralize('day', Math.abs(dueDifference), true)}`,
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

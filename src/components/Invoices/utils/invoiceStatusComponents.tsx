import type { TFunction } from 'i18next'
import { CircleAlert, CircleCheckBig, File, type LucideIcon } from 'lucide-react'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { tPlural } from '@utils/i18n/plural'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { getDueDifference } from '@utils/time/timeUtils'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'

export interface InvoiceStatusComponents {
  variant: BadgeVariant
  text: string
  subText?: string
  Icon?: LucideIcon
}

export const getInvoiceStatusBadge = (
  { variant, Icon }: InvoiceStatusComponents,
  { inline }: { inline: boolean },
) => {
  if (!Icon) return null

  const badgeSize = inline ? BadgeSize.EXTRA_SMALL : BadgeSize.SMALL
  const iconSize = inline ? 10 : 12

  return <Badge variant={variant} size={badgeSize} icon={<Icon size={iconSize} />} iconOnly />
}

export const getInvoiceStatusComponents = (
  invoice: Invoice,
  t: TFunction,
  formatNumber: (value: number) => string,
): InvoiceStatusComponents => {
  switch (invoice.status) {
    case InvoiceStatus.Draft:
      return { variant: BadgeVariant.NEUTRAL, text: t('invoices:state.draft', 'Draft'), Icon: File }

    case InvoiceStatus.WrittenOff:
      return { variant: BadgeVariant.NEUTRAL, text: t('invoices:state.written_off', 'Written Off') }

    case InvoiceStatus.PartiallyWrittenOff:
      return { variant: BadgeVariant.NEUTRAL, text: t('invoices:state.partially_written_off', 'Partially Written Off') }

    case InvoiceStatus.Refunded:
      return { variant: BadgeVariant.NEUTRAL, text: t('invoices:state.refunded', 'Refunded') }

    case InvoiceStatus.Paid:
      return { variant: BadgeVariant.SUCCESS, text: t('invoices:state.paid', 'Paid'), Icon: CircleCheckBig }

    case InvoiceStatus.Voided:
      return { variant: BadgeVariant.NEUTRAL, text: t('invoices:state.voided', 'Voided') }

    case InvoiceStatus.Saved:
    case InvoiceStatus.PartiallyPaid: {
      if (invoice.dueAt === null) {
        return {
          variant: BadgeVariant.NEUTRAL,
          text: invoice.status === InvoiceStatus.PartiallyPaid
            ? t('invoices:state.partially_paid', 'Partially Paid')
            : t('invoices:state.saved', 'Saved'),
        }
      }

      const dueDifference = getDueDifference(invoice.dueAt)

      if (dueDifference === 0) {
        return { variant: BadgeVariant.NEUTRAL, text: t('invoices:state.due_today', 'Due Today') }
      }

      if (dueDifference < 0) {
        const daysAgo = Math.abs(dueDifference)
        return {
          variant: BadgeVariant.WARNING,
          text: t('invoices:state.overdue', 'Overdue'),
          subText: tPlural(t, 'invoices:state.due_count_days_ago', {
            count: daysAgo,
            displayCount: formatNumber(daysAgo),
            one: 'Due {{displayCount}} day ago',
            other: 'Due {{displayCount}} days ago',
          }),
          Icon: CircleAlert,
        }
      }

      const daysUntilDue = Math.abs(dueDifference)
      return {
        variant: BadgeVariant.NEUTRAL,
        text: t('invoices:state.saved', 'Saved'),
        subText: tPlural(t, 'invoices:state.due_in_count_days', {
          count: daysUntilDue,
          displayCount: formatNumber(daysUntilDue),
          one: 'Due in {{displayCount}} day',
          other: 'Due in {{displayCount}} days',
        }),
      }
    }

    default:
      unsafeAssertUnreachable({
        value: invoice.status,
        message: 'Unexpected invoice status',
      })
  }
}

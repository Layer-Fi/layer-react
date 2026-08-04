import { useMemo } from 'react'
import { endOfYesterday, startOfToday } from 'date-fns'
import type { TFunction } from 'i18next'
import { CircleAlert, CircleCheckBig, File, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { tPlural } from '@utils/i18n/plural'
import { translationKey } from '@utils/i18n/translationKey'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { getDueDifference } from '@utils/time/timeUtils'
import { type ListInvoicesFilterParams } from '@api/businesses/[business-id]/invoices/get'
import { type InvoiceTableFilters } from '@providers/invoices/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { BadgeVariant } from '@ui/Badge/Badge'

export enum InvoiceStatusFilter {
  All = 'All',
  Draft = 'Draft',
  Unpaid = 'Unpaid',
  Overdue = 'Overdue',
  Saved = 'Saved',
  Paid = 'Paid',
  WrittenOff = 'Written Off',
  Voided = 'Voided',
  Refunded = 'Refunded',
}

export type InvoiceStatusOption = {
  label: string
  value: InvoiceStatusFilter
}

export const ALL_OPTION: InvoiceStatusOption = { value: InvoiceStatusFilter.All, label: 'All' }

const INVOICE_STATUS_CONFIG = [
  { value: InvoiceStatusFilter.All, ...translationKey('common:label.all', 'All') },
  { value: InvoiceStatusFilter.Draft, ...translationKey('invoices:state.draft', 'Draft') },
  { value: InvoiceStatusFilter.Unpaid, ...translationKey('invoices:state.unpaid', 'Unpaid') },
  { value: InvoiceStatusFilter.Overdue, ...translationKey('invoices:state.overdue', 'Overdue') },
  { value: InvoiceStatusFilter.Saved, ...translationKey('invoices:state.saved', 'Saved') },
  { value: InvoiceStatusFilter.Paid, ...translationKey('invoices:state.paid', 'Paid') },
  { value: InvoiceStatusFilter.Voided, ...translationKey('invoices:state.voided', 'Voided') },
  { value: InvoiceStatusFilter.Refunded, ...translationKey('invoices:state.refunded', 'Refunded') },
  { value: InvoiceStatusFilter.WrittenOff, ...translationKey('invoices:state.written_off', 'Written Off') },
]

export const useInvoiceStatusOptions = (): InvoiceStatusOption[] => {
  const { t } = useTranslation()

  return useMemo(
    () => INVOICE_STATUS_CONFIG.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )
}

const UNPAID_STATUSES = [InvoiceStatus.Saved, InvoiceStatus.PartiallyPaid]

export const getStatusFilterParams = (statusFilter: InvoiceStatusFilter) => {
  switch (statusFilter) {
    case InvoiceStatusFilter.All:
      return {}

    case InvoiceStatusFilter.Draft:
      return { status: [InvoiceStatus.Draft] }

    case InvoiceStatusFilter.Unpaid:
      return { status: UNPAID_STATUSES }

    case InvoiceStatusFilter.Overdue:
      return { status: UNPAID_STATUSES, dueAtEnd: endOfYesterday() }

    case InvoiceStatusFilter.Saved:
      return { status: UNPAID_STATUSES, dueAtStart: startOfToday() }

    case InvoiceStatusFilter.Paid:
      return { status: [InvoiceStatus.Paid, InvoiceStatus.PartiallyWrittenOff] }

    case InvoiceStatusFilter.WrittenOff:
      return { status: [InvoiceStatus.WrittenOff, InvoiceStatus.PartiallyWrittenOff] }

    case InvoiceStatusFilter.Voided:
      return { status: [InvoiceStatus.Voided] }

    case InvoiceStatusFilter.Refunded:
      return { status: [InvoiceStatus.Refunded] }

    default:
      unsafeAssertUnreachable({
        value: statusFilter,
        message: 'Unexpected status filter',
      })
  }
}

export const getListInvoiceParamsFromFilters = (
  { showSalesReceipts, status, query }: InvoiceTableFilters,
): ListInvoicesFilterParams => {
  const statusFilterParams = getStatusFilterParams(status.value)
  return { ...statusFilterParams, showSalesReceipts, query }
}

export interface InvoiceStatusDisplay {
  variant: BadgeVariant
  text: string
  subText?: string
  Icon?: LucideIcon
}

export const getInvoiceStatusDisplay = (
  invoice: Invoice,
  t: TFunction,
  formatNumber: (value: number) => string,
): InvoiceStatusDisplay => {
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

import { useMemo } from 'react'
import { endOfYesterday, startOfToday } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { InvoiceStatus } from '@schemas/invoices/invoice'
import { translationKey } from '@utils/i18n/translationKey'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { type ListInvoicesFilterParams } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { type InvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'

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

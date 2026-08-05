import { endOfYesterday, startOfToday } from 'date-fns'

import { InvoiceStatus } from '@schemas/features/invoices/invoiceStatus'
import { translationKey } from '@utils/shared/i18n/translationKey'
import { unsafeAssertUnreachable } from '@utils/shared/switch/assertUnreachable'

// The invoice status-filter contract, kept here so the route store and the
// endpoint params can use it without reaching into feature UI.

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

export const INVOICE_STATUS_CONFIG = [
  { value: InvoiceStatusFilter.All, ...translationKey('common:label.all', 'All') },
  { value: InvoiceStatusFilter.Draft, ...translationKey('invoices:invoiceStatus.state.draft', 'Draft') },
  { value: InvoiceStatusFilter.Unpaid, ...translationKey('invoices:invoiceStatus.state.unpaid', 'Unpaid') },
  { value: InvoiceStatusFilter.Overdue, ...translationKey('invoices:invoiceStatus.state.overdue', 'Overdue') },
  { value: InvoiceStatusFilter.Saved, ...translationKey('invoices:invoiceStatus.state.saved', 'Saved') },
  { value: InvoiceStatusFilter.Paid, ...translationKey('invoices:invoiceStatus.state.paid', 'Paid') },
  { value: InvoiceStatusFilter.Voided, ...translationKey('invoices:invoiceStatus.state.voided', 'Voided') },
  { value: InvoiceStatusFilter.Refunded, ...translationKey('invoices:invoiceStatus.state.refunded', 'Refunded') },
  { value: InvoiceStatusFilter.WrittenOff, ...translationKey('invoices:invoiceStatus.state.written_off', 'Written Off') },
]

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

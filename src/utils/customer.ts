import type { Customer } from '@schemas/customer'

export function getCustomerName(
  customer?: Customer | null,
) {
  return customer?.individualName
    ?? customer?.companyName
    ?? 'Unknown Customer'
}

export function getInvoiceCustomerName(
  invoice: { customer?: Customer | null, recipientName?: string | null },
) {
  return invoice.customer?.individualName
    ?? invoice.customer?.companyName
    ?? invoice.recipientName
    ?? 'Unknown Customer'
}

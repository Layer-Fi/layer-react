import type { Customer } from '@schemas/customer'

function getCustomerNameOrNull(customer?: Customer | null) {
  return customer?.individualName ?? customer?.companyName ?? null
}

export function getCustomerName(
  customer?: Customer | null,
) {
  return getCustomerNameOrNull(customer) ?? 'Unknown Customer'
}

export function getInvoiceCustomerName(
  invoice: { customer?: Customer | null, recipientName?: string | null },
) {
  return getCustomerNameOrNull(invoice.customer)
    ?? invoice.recipientName
    ?? 'Unknown Customer'
}

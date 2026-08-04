import type { Customer } from '@schemas/customerVendor/customer'

export function getCustomerName(
  customer?: Customer | null,
) {
  return customer?.individualName
    ?? customer?.companyName
    ?? 'Unknown Customer'
}

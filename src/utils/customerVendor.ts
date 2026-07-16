import type { Customer } from '@schemas/customer'
import type { Vendor } from '@schemas/vendor'

export function getCustomerName(
  customer?: Customer | null,
) {
  return customer?.individualName
    ?? customer?.companyName
    ?? 'Unknown Customer'
}

export function getVendorName(
  vendor?: Vendor | null,
) {
  return vendor?.individualName
    ?? vendor?.companyName
    ?? 'Unknown Vendor'
}

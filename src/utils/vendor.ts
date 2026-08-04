import type { Vendor } from '@schemas/customerVendor/vendor'

export function getVendorName(
  vendor?: Vendor | null,
) {
  return vendor?.individualName
    ?? vendor?.companyName
    ?? 'Unknown Vendor'
}

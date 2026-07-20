import type { Vendor } from '@schemas/vendor'

export function getVendorName(
  vendor?: Vendor | null,
) {
  return vendor?.individualName
    ?? vendor?.companyName
    ?? 'Unknown Vendor'
}

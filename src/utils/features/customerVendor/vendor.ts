import type { Vendor } from '@schemas/features/customerVendor/vendor'

export function getVendorName(
  vendor?: Vendor | null,
) {
  return vendor?.individualName
    ?? vendor?.companyName
    ?? 'Unknown Vendor'
}

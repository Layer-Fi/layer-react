import { type Vendor } from '@internal-types/vendors'

export const getVendorName = (vendor?: Vendor): string => (
  vendor?.individual_name ?? vendor?.company_name ?? vendor?.external_id ?? ''
)

import { type Vendor } from '@schemas/vendor'

export const getVendorName = (vendor: Vendor) =>
  vendor.individualName ?? vendor.companyName ?? vendor.externalId ?? 'Unknown vendor'

export class VendorAsOption {
  private internalVendor: Vendor

  constructor(vendor: Vendor) {
    this.internalVendor = vendor
  }

  get original() {
    return this.internalVendor
  }

  get label() {
    return getVendorName(this.internalVendor)
  }

  get id() {
    return this.internalVendor.id
  }

  get value() {
    return this.internalVendor.id
  }
}

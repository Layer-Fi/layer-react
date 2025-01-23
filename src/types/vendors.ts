export type VendorStatus = 'ACTIVE' | 'ARCHIVED'

export type Vendor = {
  id: string
  external_id: string
  individual_name?: string
  company_name?: string
  email?: string
  mobile_phone?: string
  office_phone?: string
  address_string?: string
  notes?: string
  status: VendorStatus
}

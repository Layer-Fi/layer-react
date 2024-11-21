export interface Business {
  id: string
  activation_at?: string
  archived_at?: string
  entity_type?: string
  external_id?: string
  imported_at?: string
  industry?: string
  legal_name?: string
  phone_number?: string
  sms_categorization_start_date?: string
  sms_enabled?: boolean
  tin?: string
  type?: string
  updated_at?: string
  us_state?: string
}

export const ENTITY_TYPES = [
  'GP',
  'LLC',
  'LLP',
  'LP',
  'SP',
  'Corp',
  'PC',
  'PLLC',
  'Nonprofit',
  'Co-op',
  'Joint Venture',
]

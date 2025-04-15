import { USStateCode } from './location'

export interface Business {
  id: string
  activation_at?: string
  archived_at?: string
  entity_type?: EntityType
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
  us_state?: USStateCode
}

export const ENTITY_TYPES = [
  { value: 'SOLE_PROP', label: 'Sole Proprietorship' },
  { value: 'LLC', label: 'Limited Liability Company' },
  { value: 'S_CORP', label: 'S Corporation' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'C_CORP', label: 'C Corporation' },
] as const

export type EntityType = (typeof ENTITY_TYPES)[number]['value']

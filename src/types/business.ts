import { type USStateCode } from '@internal-types/location'
import { translationKey } from '@utils/i18n/translationKey'

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

export const ENTITY_TYPES_CONFIG = [
  { value: 'SOLE_PROP' as const, ...translationKey('common:soleProprietorship', 'Sole Proprietorship') },
  { value: 'C_CORP' as const, ...translationKey('common:cCorporation', 'C Corporation') },
  { value: 'LLC' as const, ...translationKey('common:limitedLiabilityCompany', 'Limited Liability Company') },
  { value: 'S_CORP' as const, ...translationKey('common:sCorporation', 'S Corporation') },
  { value: 'PARTNERSHIP' as const, ...translationKey('common:partnership', 'Partnership') },
] as const

export type EntityType = (typeof ENTITY_TYPES_CONFIG)[number]['value']

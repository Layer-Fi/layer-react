import i18next from 'i18next'

import { type USStateCode } from '@internal-types/location'

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
  { value: 'SOLE_PROP', label: i18next.t('soleProprietorship', 'Sole Proprietorship') },
  { value: 'C_CORP', label: i18next.t('cCorporation', 'C Corporation') },
  { value: 'LLC', label: i18next.t('limitedLiabilityCompany', 'Limited Liability Company') },
  { value: 'S_CORP', label: i18next.t('sCorporation', 'S Corporation') },
  { value: 'PARTNERSHIP', label: i18next.t('partnership', 'Partnership') },
] as const

export type EntityType = (typeof ENTITY_TYPES)[number]['value']

import type { TFunction } from 'i18next'

import { translationKey } from '@utils/i18n/translationKey'

export const US_STATES_CONFIG = [
  { value: 'AL' as const, ...translationKey('usStates:label.alabama', 'Alabama') },
  { value: 'AK' as const, ...translationKey('usStates:label.alaska', 'Alaska') },
  { value: 'AZ' as const, ...translationKey('usStates:label.arizona', 'Arizona') },
  { value: 'AR' as const, ...translationKey('usStates:label.arkansas', 'Arkansas') },
  { value: 'CA' as const, ...translationKey('usStates:label.california', 'California') },
  { value: 'CO' as const, ...translationKey('usStates:label.colorado', 'Colorado') },
  { value: 'CT' as const, ...translationKey('usStates:label.connecticut', 'Connecticut') },
  { value: 'DE' as const, ...translationKey('usStates:label.delaware', 'Delaware') },
  { value: 'DC' as const, ...translationKey('usStates:label.district_columbia', 'District of Columbia') },
  { value: 'FL' as const, ...translationKey('usStates:label.florida', 'Florida') },
  { value: 'GA' as const, ...translationKey('usStates:label.georgia', 'Georgia') },
  { value: 'HI' as const, ...translationKey('usStates:label.hawaii', 'Hawaii') },
  { value: 'ID' as const, ...translationKey('usStates:label.idaho', 'Idaho') },
  { value: 'IL' as const, ...translationKey('usStates:label.illinois', 'Illinois') },
  { value: 'IN' as const, ...translationKey('usStates:label.indiana', 'Indiana') },
  { value: 'IA' as const, ...translationKey('usStates:label.iowa', 'Iowa') },
  { value: 'KS' as const, ...translationKey('usStates:label.kansas', 'Kansas') },
  { value: 'KY' as const, ...translationKey('usStates:label.kentucky', 'Kentucky') },
  { value: 'LA' as const, ...translationKey('usStates:label.louisiana', 'Louisiana') },
  { value: 'ME' as const, ...translationKey('usStates:label.maine', 'Maine') },
  { value: 'MD' as const, ...translationKey('usStates:label.maryland', 'Maryland') },
  { value: 'MA' as const, ...translationKey('usStates:label.massachusetts', 'Massachusetts') },
  { value: 'MI' as const, ...translationKey('usStates:label.michigan', 'Michigan') },
  { value: 'MN' as const, ...translationKey('usStates:label.minnesota', 'Minnesota') },
  { value: 'MS' as const, ...translationKey('usStates:label.mississippi', 'Mississippi') },
  { value: 'MO' as const, ...translationKey('usStates:label.missouri', 'Missouri') },
  { value: 'MT' as const, ...translationKey('usStates:label.montana', 'Montana') },
  { value: 'NE' as const, ...translationKey('usStates:label.nebraska', 'Nebraska') },
  { value: 'NV' as const, ...translationKey('usStates:label.nevada', 'Nevada') },
  { value: 'NH' as const, ...translationKey('usStates:label.new_hampshire', 'New Hampshire') },
  { value: 'NJ' as const, ...translationKey('usStates:label.new_jersey', 'New Jersey') },
  { value: 'NM' as const, ...translationKey('usStates:label.new_mexico', 'New Mexico') },
  { value: 'NY' as const, ...translationKey('usStates:label.new_york', 'New York') },
  { value: 'NC' as const, ...translationKey('usStates:label.north_carolina', 'North Carolina') },
  { value: 'ND' as const, ...translationKey('usStates:label.north_dakota', 'North Dakota') },
  { value: 'OH' as const, ...translationKey('usStates:label.ohio', 'Ohio') },
  { value: 'OK' as const, ...translationKey('usStates:label.oklahoma', 'Oklahoma') },
  { value: 'OR' as const, ...translationKey('usStates:label.oregon', 'Oregon') },
  { value: 'PA' as const, ...translationKey('usStates:label.pennsylvania', 'Pennsylvania') },
  { value: 'RI' as const, ...translationKey('usStates:label.rhode_island', 'Rhode Island') },
  { value: 'SC' as const, ...translationKey('usStates:label.south_carolina', 'South Carolina') },
  { value: 'SD' as const, ...translationKey('usStates:label.south_dakota', 'South Dakota') },
  { value: 'TN' as const, ...translationKey('usStates:label.tennessee', 'Tennessee') },
  { value: 'TX' as const, ...translationKey('usStates:label.texas', 'Texas') },
  { value: 'UT' as const, ...translationKey('usStates:label.utah', 'Utah') },
  { value: 'VT' as const, ...translationKey('usStates:label.vermont', 'Vermont') },
  { value: 'VA' as const, ...translationKey('usStates:label.virginia', 'Virginia') },
  { value: 'WA' as const, ...translationKey('usStates:label.washington', 'Washington') },
  { value: 'WV' as const, ...translationKey('usStates:label.west_virginia', 'West Virginia') },
  { value: 'WI' as const, ...translationKey('usStates:label.wisconsin', 'Wisconsin') },
  { value: 'WY' as const, ...translationKey('usStates:label.wyoming', 'Wyoming') },
  { value: 'PR' as const, ...translationKey('usStates:label.puerto_rico', 'Puerto Rico') },
] as const

export type USStateCode = (typeof US_STATES_CONFIG)[number]['value']
export type USStateConfigRow = (typeof US_STATES_CONFIG)[number]
export const US_STATE_VALUES: readonly USStateCode[] = US_STATES_CONFIG.map(s => s.value)
export type USState = { value: USStateCode, label: string }

export const getUsStateOptions = (t: TFunction) => US_STATES_CONFIG.map(state => ({
  label: t(state.i18nKey, state.defaultValue),
  value: state.value,
}))

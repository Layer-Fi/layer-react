import type { TFunction } from 'i18next'

import { translationKey } from '@utils/i18n/translationKey'

export const US_STATES_CONFIG = [
  { value: 'AL' as const, ...translationKey('usStates.alabama', 'Alabama') },
  { value: 'AK' as const, ...translationKey('usStates.alaska', 'Alaska') },
  { value: 'AZ' as const, ...translationKey('usStates.arizona', 'Arizona') },
  { value: 'AR' as const, ...translationKey('usStates.arkansas', 'Arkansas') },
  { value: 'CA' as const, ...translationKey('usStates.california', 'California') },
  { value: 'CO' as const, ...translationKey('usStates.colorado', 'Colorado') },
  { value: 'CT' as const, ...translationKey('usStates.connecticut', 'Connecticut') },
  { value: 'DE' as const, ...translationKey('usStates.delaware', 'Delaware') },
  { value: 'DC' as const, ...translationKey('usStates.districtOfColumbia', 'District of Columbia') },
  { value: 'FL' as const, ...translationKey('usStates.florida', 'Florida') },
  { value: 'GA' as const, ...translationKey('usStates.georgia', 'Georgia') },
  { value: 'HI' as const, ...translationKey('usStates.hawaii', 'Hawaii') },
  { value: 'ID' as const, ...translationKey('usStates.idaho', 'Idaho') },
  { value: 'IL' as const, ...translationKey('usStates.illinois', 'Illinois') },
  { value: 'IN' as const, ...translationKey('usStates.indiana', 'Indiana') },
  { value: 'IA' as const, ...translationKey('usStates.iowa', 'Iowa') },
  { value: 'KS' as const, ...translationKey('usStates.kansas', 'Kansas') },
  { value: 'KY' as const, ...translationKey('usStates.kentucky', 'Kentucky') },
  { value: 'LA' as const, ...translationKey('usStates.louisiana', 'Louisiana') },
  { value: 'ME' as const, ...translationKey('usStates.maine', 'Maine') },
  { value: 'MD' as const, ...translationKey('usStates.maryland', 'Maryland') },
  { value: 'MA' as const, ...translationKey('usStates.massachusetts', 'Massachusetts') },
  { value: 'MI' as const, ...translationKey('usStates.michigan', 'Michigan') },
  { value: 'MN' as const, ...translationKey('usStates.minnesota', 'Minnesota') },
  { value: 'MS' as const, ...translationKey('usStates.mississippi', 'Mississippi') },
  { value: 'MO' as const, ...translationKey('usStates.missouri', 'Missouri') },
  { value: 'MT' as const, ...translationKey('usStates.montana', 'Montana') },
  { value: 'NE' as const, ...translationKey('usStates.nebraska', 'Nebraska') },
  { value: 'NV' as const, ...translationKey('usStates.nevada', 'Nevada') },
  { value: 'NH' as const, ...translationKey('usStates.newHampshire', 'New Hampshire') },
  { value: 'NJ' as const, ...translationKey('usStates.newJersey', 'New Jersey') },
  { value: 'NM' as const, ...translationKey('usStates.newMexico', 'New Mexico') },
  { value: 'NY' as const, ...translationKey('usStates.newYork', 'New York') },
  { value: 'NC' as const, ...translationKey('usStates.northCarolina', 'North Carolina') },
  { value: 'ND' as const, ...translationKey('usStates.northDakota', 'North Dakota') },
  { value: 'OH' as const, ...translationKey('usStates.ohio', 'Ohio') },
  { value: 'OK' as const, ...translationKey('usStates.oklahoma', 'Oklahoma') },
  { value: 'OR' as const, ...translationKey('usStates.oregon', 'Oregon') },
  { value: 'PA' as const, ...translationKey('usStates.pennsylvania', 'Pennsylvania') },
  { value: 'RI' as const, ...translationKey('usStates.rhodeIsland', 'Rhode Island') },
  { value: 'SC' as const, ...translationKey('usStates.southCarolina', 'South Carolina') },
  { value: 'SD' as const, ...translationKey('usStates.southDakota', 'South Dakota') },
  { value: 'TN' as const, ...translationKey('usStates.tennessee', 'Tennessee') },
  { value: 'TX' as const, ...translationKey('usStates.texas', 'Texas') },
  { value: 'UT' as const, ...translationKey('usStates.utah', 'Utah') },
  { value: 'VT' as const, ...translationKey('usStates.vermont', 'Vermont') },
  { value: 'VA' as const, ...translationKey('usStates.virginia', 'Virginia') },
  { value: 'WA' as const, ...translationKey('usStates.washington', 'Washington') },
  { value: 'WV' as const, ...translationKey('usStates.westVirginia', 'West Virginia') },
  { value: 'WI' as const, ...translationKey('usStates.wisconsin', 'Wisconsin') },
  { value: 'WY' as const, ...translationKey('usStates.wyoming', 'Wyoming') },
  { value: 'PR' as const, ...translationKey('usStates.puertoRico', 'Puerto Rico') },
] as const

export type USStateCode = (typeof US_STATES_CONFIG)[number]['value']
export type USStateConfigRow = (typeof US_STATES_CONFIG)[number]
export const US_STATE_VALUES: readonly USStateCode[] = US_STATES_CONFIG.map(s => s.value)
export type USState = { value: USStateCode, label: string }

export const getUsStateOptions = (t: TFunction) => US_STATES_CONFIG.map(state => ({
  label: t(state.i18nKey, state.defaultValue),
  value: state.value,
}))

import type { TFunction } from 'i18next'

import { translationKey } from '@utils/i18n/translationKey'

export const US_STATES_CONFIG = [
  { value: 'AL' as const, ...translationKey('alabama', 'Alabama') },
  { value: 'AK' as const, ...translationKey('alaska', 'Alaska') },
  { value: 'AZ' as const, ...translationKey('arizona', 'Arizona') },
  { value: 'AR' as const, ...translationKey('arkansas', 'Arkansas') },
  { value: 'CA' as const, ...translationKey('california', 'California') },
  { value: 'CO' as const, ...translationKey('colorado', 'Colorado') },
  { value: 'CT' as const, ...translationKey('connecticut', 'Connecticut') },
  { value: 'DE' as const, ...translationKey('delaware', 'Delaware') },
  { value: 'DC' as const, ...translationKey('districtOfColumbia', 'District of Columbia') },
  { value: 'FL' as const, ...translationKey('florida', 'Florida') },
  { value: 'GA' as const, ...translationKey('georgia', 'Georgia') },
  { value: 'HI' as const, ...translationKey('hawaii', 'Hawaii') },
  { value: 'ID' as const, ...translationKey('idaho', 'Idaho') },
  { value: 'IL' as const, ...translationKey('illinois', 'Illinois') },
  { value: 'IN' as const, ...translationKey('indiana', 'Indiana') },
  { value: 'IA' as const, ...translationKey('iowa', 'Iowa') },
  { value: 'KS' as const, ...translationKey('kansas', 'Kansas') },
  { value: 'KY' as const, ...translationKey('kentucky', 'Kentucky') },
  { value: 'LA' as const, ...translationKey('louisiana', 'Louisiana') },
  { value: 'ME' as const, ...translationKey('maine', 'Maine') },
  { value: 'MD' as const, ...translationKey('maryland', 'Maryland') },
  { value: 'MA' as const, ...translationKey('massachusetts', 'Massachusetts') },
  { value: 'MI' as const, ...translationKey('michigan', 'Michigan') },
  { value: 'MN' as const, ...translationKey('minnesota', 'Minnesota') },
  { value: 'MS' as const, ...translationKey('mississippi', 'Mississippi') },
  { value: 'MO' as const, ...translationKey('missouri', 'Missouri') },
  { value: 'MT' as const, ...translationKey('montana', 'Montana') },
  { value: 'NE' as const, ...translationKey('nebraska', 'Nebraska') },
  { value: 'NV' as const, ...translationKey('nevada', 'Nevada') },
  { value: 'NH' as const, ...translationKey('newHampshire', 'New Hampshire') },
  { value: 'NJ' as const, ...translationKey('newJersey', 'New Jersey') },
  { value: 'NM' as const, ...translationKey('newMexico', 'New Mexico') },
  { value: 'NY' as const, ...translationKey('newYork', 'New York') },
  { value: 'NC' as const, ...translationKey('northCarolina', 'North Carolina') },
  { value: 'ND' as const, ...translationKey('northDakota', 'North Dakota') },
  { value: 'OH' as const, ...translationKey('ohio', 'Ohio') },
  { value: 'OK' as const, ...translationKey('oklahoma', 'Oklahoma') },
  { value: 'OR' as const, ...translationKey('oregon', 'Oregon') },
  { value: 'PA' as const, ...translationKey('pennsylvania', 'Pennsylvania') },
  { value: 'RI' as const, ...translationKey('rhodeIsland', 'Rhode Island') },
  { value: 'SC' as const, ...translationKey('southCarolina', 'South Carolina') },
  { value: 'SD' as const, ...translationKey('southDakota', 'South Dakota') },
  { value: 'TN' as const, ...translationKey('tennessee', 'Tennessee') },
  { value: 'TX' as const, ...translationKey('texas', 'Texas') },
  { value: 'UT' as const, ...translationKey('utah', 'Utah') },
  { value: 'VT' as const, ...translationKey('vermont', 'Vermont') },
  { value: 'VA' as const, ...translationKey('virginia', 'Virginia') },
  { value: 'WA' as const, ...translationKey('washington', 'Washington') },
  { value: 'WV' as const, ...translationKey('westVirginia', 'West Virginia') },
  { value: 'WI' as const, ...translationKey('wisconsin', 'Wisconsin') },
  { value: 'WY' as const, ...translationKey('wyoming', 'Wyoming') },
  { value: 'PR' as const, ...translationKey('puertoRico', 'Puerto Rico') },
] as const

export type USStateCode = (typeof US_STATES_CONFIG)[number]['value']
export type USStateConfigRow = (typeof US_STATES_CONFIG)[number]
export const US_STATE_VALUES: readonly USStateCode[] = US_STATES_CONFIG.map(s => s.value)
export type USState = { value: USStateCode, label: string }

export const getUsStateOptions = (t: TFunction) => US_STATES_CONFIG.map(state => ({
  label: t(state.i18nKey, state.defaultValue),
  value: state.value,
}))

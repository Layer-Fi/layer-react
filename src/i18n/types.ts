import type { Resource } from 'i18next'

export type IntlSettings = {
  language: string
  formatRegion: string
  shortDateFormat: string
  numberFormat: string
  currency: string
}

export type IntlSettingsInput = Partial<IntlSettings>
export type I18nResources = Resource

export const DEFAULT_INTL_SETTINGS: IntlSettings = {
  language: 'en',
  formatRegion: 'US',
  shortDateFormat: 'MM/DD/YYYY',
  numberFormat: ',#.',
  currency: 'USD',
}

import { DEFAULT_INTL_SETTINGS, type IntlSettings } from '@i18n/types'

let currentSettings: IntlSettings = DEFAULT_INTL_SETTINGS

export const setIntlSettings = (next: IntlSettings) => {
  currentSettings = next
}

export const getIntlSettings = () => currentSettings

export const getIntlHeaderValue = () => {
  const { language, formatRegion, shortDateFormat, numberFormat } = currentSettings

  return JSON.stringify({
    language,
    formatRegion,
    shortDateFormat,
    numberFormat,
  })
}

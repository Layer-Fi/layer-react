export enum SupportedLocale {
  enUS = 'en-US',
  frCA = 'fr-CA',
}

export const DEFAULT_LOCALE = SupportedLocale.enUS
export const SUPPORTED_LOCALES = Object.values(SupportedLocale)

export const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale)

export const getIntlLocale = (locale?: string): SupportedLocale => {
  if (!locale) return DEFAULT_LOCALE

  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE
}

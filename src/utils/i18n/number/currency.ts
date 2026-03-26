import { getIntlLocale, SupportedLocale } from '@utils/i18n/supportedLocale'

const LOCALE_CURRENCY_MAP: Record<SupportedLocale, string> = {
  [SupportedLocale.enUS]: 'USD',
  [SupportedLocale.frCA]: 'CAD',
}

export const getCurrencyForLocale = (locale?: string): string => {
  const effectiveLocale = getIntlLocale(locale)

  return LOCALE_CURRENCY_MAP[effectiveLocale]
}

import { getIntlLocale, SupportedLocale } from '@utils/i18n/supportedLocale'

const LOCALE_CURRENCY_MAP: Record<SupportedLocale, string> = {
  [SupportedLocale.enUS]: 'USD',
  [SupportedLocale.frCA]: 'CAD',
}
const localeCurrencySymbolCache = new Map<string, string>()

export const getCurrencyForLocale = (locale: string): string => {
  const effectiveLocale = getIntlLocale(locale)

  return LOCALE_CURRENCY_MAP[effectiveLocale]
}

export const getLocaleCurrencySymbol = (locale: string): string => {
  const currency = getCurrencyForLocale(locale)
  const cached = localeCurrencySymbolCache.get(currency)

  if (cached) return cached

  const currencyPart = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).formatToParts(1).find(part => part.type === 'currency')

  const currencySymbol = currencyPart?.value ?? currency
  localeCurrencySymbolCache.set(currency, currencySymbol)

  return currencySymbol
}

export const transformCurrencyValue = (rawValue: string, sourceDecimalSeparator: string, targetDecimalSeparator?: string): string => {
  const normalized = rawValue
    .split('')
    .filter(char => (char >= '0' && char <= '9') || char === sourceDecimalSeparator)
    .join('')

  const [integerPart = '', ...fractionParts] = normalized.split(sourceDecimalSeparator)
  if (fractionParts.length === 0) {
    return integerPart
  }

  const resultDecimalSeparator = targetDecimalSeparator ?? sourceDecimalSeparator
  const fractionalPart = fractionParts.join('').slice(0, 2)
  return `${integerPart}${resultDecimalSeparator}${fractionalPart}`
}

import type { IntlSettings } from '@i18n/types'

const buildLocaleTag = (settings: IntlSettings) =>
  `${settings.language}-${settings.formatRegion}`

export const createIntlFormatters = (settings: IntlSettings) => {
  const locale = buildLocaleTag(settings)

  return {
    formatCurrency: (amount: number, currency?: string) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency ?? settings.currency,
      }).format(amount),
    formatDate: (date: Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) =>
      new Intl.DateTimeFormat(locale, options).format(date),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, options).format(value),
    formatPercent: (value: number, options: Intl.NumberFormatOptions = {}) =>
      new Intl.NumberFormat(locale, {
        style: 'percent',
        maximumFractionDigits: 1,
        ...options,
      }).format(value),
  }
}

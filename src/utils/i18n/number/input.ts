export type NumberInput = number | string | null | undefined

export type LocaleNumberSeparators = {
  decimalSeparator: string
  groupSeparator: string
}

const localeNumberSeparatorsCache = new Map<string, LocaleNumberSeparators>()
const ARBITRARY_NUMBER = 1000.1

export const getLocaleNumberSeparators = (locale: string): LocaleNumberSeparators => {
  const cacheKey = locale ?? ''
  const cached = localeNumberSeparatorsCache.get(cacheKey)

  if (cached) return cached

  const parts = new Intl.NumberFormat(locale).formatToParts(ARBITRARY_NUMBER)
  const separators = {
    decimalSeparator: parts.find(part => part.type === 'decimal')?.value ?? '.',
    groupSeparator: parts.find(part => part.type === 'group')?.value ?? ',',
  }

  localeNumberSeparatorsCache.set(cacheKey, separators)

  return separators
}

const normalizeLocaleNumberString = (value: string, locale: string): string => {
  const { decimalSeparator, groupSeparator } = getLocaleNumberSeparators(locale)
  const withoutGrouping = value
    .split(groupSeparator)
    .join('')
    .replace(/\u00A0/g, '')
    .replace(/\u202F/g, '')
    .replace(/\s/g, '')

  if (decimalSeparator === '.') {
    return withoutGrouping
  }

  return withoutGrouping.split(decimalSeparator).join('.')
}

export const toLocalizedCents = (value: NumberInput, locale: string): number | undefined => {
  const parsed = toLocalizedNumber(value, locale)
  if (parsed === undefined) return undefined

  return Math.round(parsed * 100)
}

export const toLocalizedNumber = (value: NumberInput, locale: string) => {
  let localizedValue: NumberInput = value
  if (typeof value === 'string') {
    localizedValue = normalizeLocaleNumberString(value, locale)
  }

  return toNumber(localizedValue)
}

export const toNumber = (value: NumberInput): number | undefined => {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  return undefined
}

/**
 * Capitalize first letter of the given text.
 */
export const capitalizeFirstLetter = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Convert number into percentage.
 *
 * @example
 * 0.112 -> 11%
 * 0.09843 -> 9.8%
 * 0.00123 -> 0.12%
 */
export const formatPercent = (
  value?: number,
  options?: Intl.NumberFormatOptions,
) => {
  if (!value && value !== 0) {
    return
  }

  const val = value * 100

  let defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }

  if (Math.abs(val) < 10) {
    defaultOptions = {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }
  }

  if (Math.abs(val) < 1) {
    defaultOptions = {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }
  }

  if (val === 0) {
    defaultOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  }

  return val.toLocaleString('en-US', {
    ...defaultOptions,
    ...options,
  })
}

/**
 * Convert Enum-like (upper snakecase) text into human friendly format.
 */
export const humanizeEnum = (text: string) => {
  return capitalizeFirstLetter(text.replace(/_/gi, ' ').toLowerCase())
}

export const convertNumberToCurrency = (amount: number | undefined): string => {
  if (!amount) return ''

  let formattedValue = amount.toLocaleString('en-US')

  return formattedValue.length > 0 ? `$${formattedValue}` : ''
}

export const convertCurrencyToNumber = (amount: string): string =>
  amount
    .replace('$', '')
    .replace(',', '')
    .replace(/[^\d.]/g, '')
    .replace(/(?!^)-/g, '')
    .replace(/(\..*)\./g, '$1')
    .replace(/(\.\d{2})\d+/, '$1')
    .replace(/^0(?!\.)/, '')

export const toRFC5545Date = (
  date: Date,
  includeTime = false,
  useUTC = true,
) => {
  const pad = (number: number) => (number < 10 ? '0' + number : number)

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())

  const hours = pad(useUTC ? date.getUTCHours() : date.getHours())
  const minutes = pad(useUTC ? date.getUTCMinutes() : date.getMinutes())
  const seconds = pad(useUTC ? date.getUTCSeconds() : date.getSeconds())

  const time = `${hours}${minutes}${seconds}`

  return useUTC
    ? `${year}${month}${day}T${time}Z`
    : `${year}${month}${day}T${time}`
}

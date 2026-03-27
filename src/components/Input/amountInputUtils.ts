import type { IntlShape } from 'react-intl'

import { getCurrencyForLocale } from '@utils/i18n/number/currency'
import { getLocaleNumberSeparators } from '@utils/i18n/number/input'

const isNumericPart = (partType: Intl.NumberFormatPartTypes) => {
  return partType === 'integer' || partType === 'fraction'
}

export const getCurrencyFormatConfig = (intl: IntlShape) => {
  const currency = getCurrencyForLocale(intl.locale)

  const parts = intl.formatNumberToParts(1000.1, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const { decimalSeparator, groupSeparator } = getLocaleNumberSeparators(intl.locale)

  const firstNumberIndex = parts.findIndex(part => isNumericPart(part.type))
  const lastNumberIndex = parts.reduceRight((lastMatch, part, index) => {
    if (lastMatch !== -1) return lastMatch
    return isNumericPart(part.type) ? index : -1
  }, -1)

  if (firstNumberIndex === -1 || lastNumberIndex === -1) {
    return { decimalSeparator, groupSeparator, prefix: '', suffix: '' }
  }

  return {
    decimalSeparator,
    groupSeparator,
    prefix: parts.slice(0, firstNumberIndex).map(part => part.value).join(''),
    suffix: parts.slice(lastNumberIndex + 1).map(part => part.value).join(''),
  }
}

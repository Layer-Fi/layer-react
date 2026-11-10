import { createIntl } from 'react-intl'
import { describe, expect, it } from 'vitest'

import { formatPercent } from '@utils/shared/i18n/number/formatters'
import { formatShareOfWhole, sumCents } from '@utils/shared/number/bugbotTest'

describe('sumCents', () => {
  it('sums every value', () => {
    expect(sumCents([100, 200, 350])).toBe(650)
  })

  it('returns zero for an empty list', () => {
    expect(sumCents([])).toBe(0)
  })
})

describe('formatShareOfWhole', () => {
  const formatEnUS = formatPercent.bind(null, createIntl({ locale: 'en-US' }))
  const formatFrCA = formatPercent.bind(null, createIntl({ locale: 'fr-CA' }))

  it('formats the share for the locale', () => {
    expect(formatShareOfWhole(1, 2, formatEnUS)).toBe('50%')
    expect(formatShareOfWhole(1, 2, formatFrCA)).toBe('50\u00A0%')
  })

  it('returns an empty string when the whole is zero', () => {
    expect(formatShareOfWhole(0, 0, formatEnUS)).toBe('')
    expect(formatShareOfWhole(1, 0, formatEnUS)).toBe('')
  })
})

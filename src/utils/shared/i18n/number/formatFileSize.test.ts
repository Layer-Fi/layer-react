import { createIntl } from 'react-intl'
import { describe, expect, it } from 'vitest'

import { formatFileSize } from '@utils/shared/i18n/number/formatters'

const intl = createIntl({ locale: 'en-US' })

describe('formatFileSize', () => {
  it.each([
    [0, '0 bytes'],
    [1, '1 byte'],
    [999, '999 bytes'],
    [1_000, '1 kB'],
    [248_000, '248 kB'],
    [1_200_000, '1.2 MB'],
    [10_000_000, '10 MB'],
    [2_500_000_000, '2.5 GB'],
    [5_000_000_000_000, '5,000 GB'],
  ])('formats %i bytes as %s', (bytes, expected) => {
    expect(formatFileSize(intl, bytes)).toBe(expected)
  })
})

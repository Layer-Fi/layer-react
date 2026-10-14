import { describe, expect, it } from 'vitest'

import { notEmpty } from '@utils/shared/string/notEmpty'

describe('notEmpty', () => {
  it.each([null, undefined, '', '   '])('treats %j as empty', (value) => {
    expect(notEmpty(value)).toBe(false)
  })

  it('accepts text with surrounding whitespace', () => {
    expect(notEmpty('  Acme Co ')).toBe(true)
  })
})

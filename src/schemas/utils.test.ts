import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { createOpenEnumSchema } from '@schemas/utils'

enum TestEnum {
  Known = 'KNOWN',
}

const decode = Schema.decodeUnknownSync(createOpenEnumSchema(TestEnum))

describe('createOpenEnumSchema', () => {
  it('decodes known enum members', () => {
    expect(decode('KNOWN')).toBe(TestEnum.Known)
  })

  it('decodes strings outside of the enum', () => {
    expect(decode('SOME_FUTURE_VALUE')).toBe('SOME_FUTURE_VALUE')
  })

  it('rejects non-string values', () => {
    expect(() => decode(1)).toThrow()
    expect(() => decode(null)).toThrow()
  })
})

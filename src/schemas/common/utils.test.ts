import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import {
  createOpenEnumSchema,
  createTransformedEnumSchema,
  UnwrappedDataResponseSchema,
} from '@schemas/common/utils'

enum TestEnum {
  Known = 'KNOWN',
  Fallback = 'FALLBACK',
}

describe('createOpenEnumSchema', () => {
  const decode = Schema.decodeUnknownSync(createOpenEnumSchema(TestEnum))

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

describe('createTransformedEnumSchema', () => {
  const schema = createTransformedEnumSchema(
    Schema.Enums(TestEnum),
    TestEnum,
    TestEnum.Fallback,
  )
  const decode = Schema.decodeUnknownSync(schema)

  it('decodes known enum members', () => {
    expect(decode('KNOWN')).toBe(TestEnum.Known)
  })

  it('falls back to the default for strings outside of the enum', () => {
    expect(decode('SOME_FUTURE_VALUE')).toBe(TestEnum.Fallback)
  })

  it('rejects empty and non-string values', () => {
    expect(() => decode('')).toThrow()
    expect(() => decode('  ')).toThrow()
    expect(() => decode(1)).toThrow()
    expect(() => decode(null)).toThrow()
  })

  it('encodes back to the raw value', () => {
    expect(Schema.encodeSync(schema)(TestEnum.Known)).toBe('KNOWN')
  })
})

describe('UnwrappedDataResponseSchema', () => {
  const schema = UnwrappedDataResponseSchema(Schema.Struct({ id: Schema.NumberFromString }))
  const decode = Schema.decodeUnknownSync(schema)

  it('unwraps the data envelope and decodes the inner schema', () => {
    expect(decode({ data: { id: '1' } })).toEqual({ id: 1 })
  })

  it('ignores extra keys alongside data', () => {
    expect(decode({ data: { id: '1' }, meta: { page: 1 } })).toEqual({ id: 1 })
  })

  it('rejects a missing envelope or an invalid payload', () => {
    expect(() => decode({ id: '1' })).toThrow()
    expect(() => decode({ data: { id: 'not-a-number' } })).toThrow()
    expect(() => decode(null)).toThrow()
  })

  it('re-wraps in a data envelope on encode', () => {
    expect(Schema.encodeSync(schema)({ id: 1 })).toEqual({ data: { id: '1' } })
  })
})

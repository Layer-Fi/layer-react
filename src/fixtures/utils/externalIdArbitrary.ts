import type { FastCheck } from 'effect'

export const externalIdArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.integer({ min: 10000, max: 99999 }).map(n => `ext_${n}`),
  )

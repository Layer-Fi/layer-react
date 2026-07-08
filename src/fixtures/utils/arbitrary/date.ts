import type { FastCheck } from 'effect'

export const dateArbitrary = (fc: typeof FastCheck) =>
  fc.date({
    min: new Date('2020-01-01T00:00:00Z'),
    max: new Date('2025-12-31T23:59:59Z'),
    noInvalidDate: true,
  })

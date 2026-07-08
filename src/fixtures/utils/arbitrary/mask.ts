import { type FastCheck } from 'effect'

export const maskArbitrary = (fc: typeof FastCheck) =>
  fc.integer({ min: 0, max: 9999 }).map(n => String(n).padStart(4, '0'))

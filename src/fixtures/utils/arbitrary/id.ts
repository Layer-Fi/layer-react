import { type FastCheck } from 'effect'

export const FixtureIdPrefix = {
  bankAccount: '00000001',
  customAccount: '00000002',
  customer: '00000003',
  vendor: '00000004',
  vehicle: '00000005',
  trip: '00000006',
  catalogService: '00000007',
  timeEntry: '00000008',
  chartOfAccount: '00000009',
  ledgerEntry: '0000000a',
  businessTask: '0000000b',
  bookkeepingPeriod: '0000000c',
} as const

const HEX = '0123456789abcdef'.split('')

const hex = (fc: typeof FastCheck, length: number) =>
  fc.stringOf(fc.constantFrom(...HEX), { minLength: length, maxLength: length })

export const idArbitrary = (prefix: string) => (fc: typeof FastCheck) =>
  fc.tuple(hex(fc, 4), hex(fc, 3), hex(fc, 3), hex(fc, 12))
    .map(([group2, group3, group4, group5]) => `${prefix}-${group2}-4${group3}-8${group4}-${group5}`)

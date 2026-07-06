import type { FastCheck } from 'effect'

// Uses the NANP-reserved 555-01XX block — the real-world convention for
// fictional phone numbers — so generated fixtures can't collide with a real
// number (the same idea as `.test` email domains).
export const phoneNumberArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.tuple(
      fc.integer({ min: 200, max: 999 }),
      fc.integer({ min: 0, max: 99 }),
    ).map(([areaCode, line]) => `+1${areaCode}55501${String(line).padStart(2, '0')}`),
  )

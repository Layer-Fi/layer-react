import { type FastCheck } from 'effect'

import { centsAmountArbitrary } from '@fixtures/utils/arbitrary/amount'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'

const MERCHANT_AMOUNT_RANGES: ReadonlyArray<readonly [merchant: string, minDollars: number, maxDollars: number]> = [
  ['Starbucks', 6, 55],
  ['Chipotle', 12, 90],
  ['Uber', 9, 75],
  ['Shell', 30, 120],
  ['USPS', 8, 150],
  ['FedEx Office', 15, 250],
  ['Staples', 20, 400],
  ['U-Haul', 40, 450],
  ['Verizon Wireless', 80, 420],
  ['Uline', 90, 900],
  ['Costco Business Center', 120, 1100],
  ['The Home Depot', 40, 1300],
  ['Amazon Business', 25, 800],
  ['Best Buy', 60, 1400],
  ['Sysco', 200, 1400],
  ['Delta Air Lines', 180, 1200],
  ['Southwest Airlines', 140, 900],
  ['Marriott', 160, 1100],
]

const dayOfMonthArbitrary = (fc: typeof FastCheck) => fc.integer({ min: 2, max: 28 })

export const taskSeedArbitrary = (fc: typeof FastCheck) =>
  fc.tuple(
    idArbitrary(FixtureIdPrefix.businessTask)(fc),
    dayOfMonthArbitrary(fc),
    fc.constantFrom(...MERCHANT_AMOUNT_RANGES).chain(([merchant, minDollars, maxDollars]) =>
      centsAmountArbitrary({ minDollars, maxDollars })(fc)
        .map(amountCents => ({ merchant, amountCents }))),
  ).map(([id, day, { merchant, amountCents }]) => ({ id, day, merchant, amountCents }))

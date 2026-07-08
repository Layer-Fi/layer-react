import { type FastCheck } from 'effect'

import { serviceNames } from '@fixtures/catalogServices/constants'
import { centsAmountArbitrary } from '@fixtures/utils/arbitrary/amount'

export const serviceNameArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...serviceNames)

export const billableRatePerHourArbitrary = centsAmountArbitrary({ minDollars: 25, maxDollars: 300, stepDollars: 5 })

import { markAccountNeedingConfirmation } from '@fixtures/bankAccounts/mocks'
import { schema } from '@fixtures/bankAccounts/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

const generate = createGenerator(schema, {
  uniqueBy: [account => account.id],
})

export const generator = () => generate({ numRuns: 5 })

/**
 * Randomly generates bank accounts flagged as needing confirmation - what a
 * fake Plaid link session "finds". Same seed, same accounts; vary the seed to
 * produce fresh banks per link session.
 */
export const generateAccountsNeedingConfirmation = (count: number, seed: number) =>
  generate({ numRuns: count, seed }).map(markAccountNeedingConfirmation)

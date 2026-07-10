import { markAccountNeedingConfirmation } from '@fixtures/bankAccounts/mocks'
import { schema } from '@fixtures/bankAccounts/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

const generate = createGenerator(schema, {
  uniqueBy: [account => account.id],
})

export const generator = () => generate({ numRuns: 5 })

export const generateAccountsNeedingConfirmation = (count: number, seed: number) =>
  generate({ numRuns: count, seed }).map(markAccountNeedingConfirmation)

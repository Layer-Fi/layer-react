import { withBankTransactionDate } from '@fixtures/bankTransactions/derive'
import { schema } from '@fixtures/bankTransactions/schema'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { spreadDateAcrossYear } from '@fixtures/utils/spreadDateAcrossYear'

const generateBankTransactions = createGenerator(schema, {
  uniqueBy: [transaction => transaction.id],
  numRuns: 100,
  seed: 7,
})

const dateAcrossYear = (index: number, total: number) => {
  const { year, month, day } = spreadDateAcrossYear(FIXTURE_YEAR, index, total)

  return new Date(Date.UTC(year, month - 1, day, 15, 45))
}

export const generator: typeof generateBankTransactions = (overrides) => {
  const transactions = generateBankTransactions(overrides)

  return transactions
    .map((transaction, index) =>
      withBankTransactionDate(transaction, dateAcrossYear(index, transactions.length)))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { makeCounterpartyTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/counterparty'
import { askTransactions, fixtureId, type UnifiedAskFormTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

export const p2pCounterpartyTaskSeeds: UnifiedAskFormTaskSeeds = {
  9: makeCounterpartyTask({
    id: fixtureId('c11'),
    counterparty: 'Alex Rivera',
    title: 'Venmo payments to Alex Rivera',
    question: 'You paid Alex Rivera $525.00 on Venmo across 3 payments. What were these for?',
    noun: 'payment',
    suggestions: [bankTransactionCategories.payrollContractors, bankTransactionCategories.rent],
    transactions: askTransactions(9, [
      { id: 'b11', day: 2, amount: -15000, description: 'VENMO PAYMENT 1023456 ALEX RIVERA' },
      { id: 'b12', day: 12, amount: -15000, description: 'VENMO PAYMENT 1029981 ALEX RIVERA' },
      { id: 'b13', day: 24, amount: -22500, description: 'VENMO PAYMENT 1034410 ALEX RIVERA' },
    ]),
  }),
}

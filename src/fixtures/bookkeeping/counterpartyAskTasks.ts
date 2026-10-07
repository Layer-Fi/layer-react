import { makeAccountId, makeStableName } from '@schemas/common/accountIdentifier'
import { BankTransactionDirection, type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import {
  BusinessTaskStatus,
  COUNTERPARTY_ASK_TASK_TYPE,
} from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import {
  type CounterpartyAskAccount,
  type CounterpartyAskTask,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const RETAIL_SUGGESTIONS: readonly CounterpartyAskAccount[] = [
  {
    accountIdentifier: makeAccountId(bankTransactionCategories.officeExpenses.id),
    name: bankTransactionCategories.officeExpenses.displayName,
  },
  {
    accountIdentifier: makeAccountId(bankTransactionCategories.otherBusinessExpenses.id),
    name: bankTransactionCategories.otherBusinessExpenses.displayName,
  },
  {
    accountIdentifier: makeStableName(bankTransactionCategories.meals.stableName),
    name: bankTransactionCategories.meals.displayName,
  },
]

type AskTransactionSeed = {
  id: string
  month: number
  day: number
  amount: number
  counterpartyName: string
  description: string
}

const makeAskTransaction = (
  { id, month, day, amount, counterpartyName, description }: AskTransactionSeed,
): MinimalBankTransaction => ({
  id,
  date: new Date(Date.UTC(FIXTURE_YEAR, month - 1, day)),
  direction: BankTransactionDirection.Debit,
  amount,
  counterpartyName,
  description,
})

const baseCounterpartyAskTask: CounterpartyAskTask = {
  id: '00000000-0000-4000-8000-000000000901',
  status: BusinessTaskStatus.Todo,
  taskType: COUNTERPARTY_ASK_TASK_TYPE,
  title: 'Costco purchases',
  question: 'You spent $307.74 at Costco across 1 transaction. '
    + 'Can you tell us a bit more about what these were for?',
  counterparty: {
    id: '00000000-0000-4000-8000-000000000701',
    name: 'Costco',
    mccs: [],
  },
  suggestions: RETAIL_SUGGESTIONS,
  transactions: [makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a01', month: 1, day: 14, amount: 30774, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' })],
  transactionResponses: [],
  userResponse: null,
  responseAccount: null,
  totalCount: 1,
  totalAmount: 30774,
  alwaysThis: false,
  resolvedByTaskId: null,
}

const { make: makeBaseCounterpartyAskTask } = createFixtureFactory(baseCounterpartyAskTask)

const toUnansweredResponses = (
  transactions: CounterpartyAskTask['transactions'],
): CounterpartyAskTask['transactionResponses'] =>
  transactions.map(transaction => ({
    transactionId: transaction.id,
    userResponse: null,
    responseAccount: null,
  }))

export const makeCounterpartyAskTask = (
  overrides?: Partial<CounterpartyAskTask>,
): CounterpartyAskTask => {
  const task = makeBaseCounterpartyAskTask(overrides)

  return overrides?.transactionResponses
    ? task
    : { ...task, transactionResponses: toUnansweredResponses(task.transactions) }
}

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

const RENT_SUGGESTIONS: readonly CounterpartyAskAccount[] = [
  {
    accountIdentifier: makeStableName(bankTransactionCategories.rent.stableName),
    name: bankTransactionCategories.rent.displayName,
  },
]

type AskTransactionSeed = {
  id: string
  year: number
  month: number
  day: number
  amount: number
  counterpartyName: string
  description: string
}

const makeAskTransaction = (
  { id, year, month, day, amount, counterpartyName, description }: AskTransactionSeed,
): MinimalBankTransaction => ({
  id,
  date: new Date(Date.UTC(year, month - 1, day)),
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
  transactions: [makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a01', year: FIXTURE_YEAR, month: 1, day: 14, amount: 30774, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' })],
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

const COUNTERPARTY_ASK_SEEDS_BY_MONTH: Record<number, (month: number) => CounterpartyAskTask> = {
  7: month => makeCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000917',
    title: 'SQ *NAIL BAR purchases',
    question: 'You spent $84.00 at SQ *NAIL BAR across 1 transaction. '
      + 'Can you tell us a bit more about what these were for?',
    counterparty: {
      id: '00000000-0000-4000-8000-000000000703',
      name: 'SQ *NAIL BAR',
      mccs: [],
    },
    suggestions: [],
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a08', year: FIXTURE_YEAR, month, day: 9, amount: 8400, counterpartyName: 'SQ *NAIL BAR', description: 'SQ *NAIL BAR' }),
    ],
    totalAmount: 8400,
  }),

  8: month => makeCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000916',
    title: 'Brick and Mortar Real Estate Services purchases',
    question: 'You spent $736.74 at Brick and Mortar Real Estate Services across 1 transaction. '
      + 'Can you tell us a bit more about what these were for?',
    counterparty: {
      id: '00000000-0000-4000-8000-000000000702',
      name: 'Brick and Mortar Real Estate Services',
      mccs: [],
    },
    suggestions: RENT_SUGGESTIONS,
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a07', year: FIXTURE_YEAR, month, day: 1, amount: 73674, counterpartyName: 'Brick and Mortar Real Estate Services', description: 'BRICK+MORTAR RE SVCS' }),
    ],
    totalAmount: 73674,
  }),

  9: month => makeCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000911',
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a01', year: FIXTURE_YEAR, month, day: 14, amount: 30774, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' }),
    ],
  }),

  10: month => makeCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000912',
    question: 'You spent $836.45 at Costco across 2 transactions. '
      + 'Can you tell us a bit more about what these were for?',
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a02', year: FIXTURE_YEAR, month, day: 3, amount: 61250, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' }),
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a03', year: FIXTURE_YEAR, month, day: 19, amount: 22395, counterpartyName: 'Costco', description: 'COSTCO GAS #1042' }),
    ],
    totalCount: 2,
    totalAmount: 83645,
  }),

  11: month => makeCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000913',
    question: '3 more Costco transactions came in, totaling $297.48. '
      + 'Can you tell us a bit more about what these were for?',
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a04', year: FIXTURE_YEAR, month, day: 2, amount: 14899, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' }),
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a05', year: FIXTURE_YEAR, month, day: 11, amount: 9932, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' }),
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a06', year: FIXTURE_YEAR, month, day: 27, amount: 4917, counterpartyName: 'Costco', description: 'COSTCO GAS #1042' }),
    ],
    totalCount: 3,
    totalAmount: 29748,
  }),
}

const hasCounterpartyAskSeed = (year: number, month: number) =>
  year === FIXTURE_YEAR && month in COUNTERPARTY_ASK_SEEDS_BY_MONTH

export const counterpartyAskCountFor = (year: number, month: number) =>
  hasCounterpartyAskSeed(year, month) ? 1 : 0

export const makeCounterpartyAskTasks = (year: number, month: number): CounterpartyAskTask[] => {
  const seed = COUNTERPARTY_ASK_SEEDS_BY_MONTH[month]

  return seed && year === FIXTURE_YEAR ? [seed(month)] : []
}

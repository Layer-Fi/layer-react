import { makeAccountId, makeStableName } from '@schemas/common/accountIdentifier'
import { BankTransactionDirection, type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import { type AnyCounterpartyAskTask } from '@schemas/features/bookkeeping/businessTask'
import {
  BusinessTaskStatus,
  COUNTERPARTY_ASK_TASK_TYPE,
  P2P_COUNTERPARTY_ASK_TASK_TYPE,
} from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type CounterpartyAskAccount } from '@schemas/features/bookkeeping/businessTasks/baseCounterpartyAskTask'
import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type P2PCounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/p2pCounterpartyAskTask'

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

const P2P_SUGGESTIONS: readonly CounterpartyAskAccount[] = [
  {
    accountIdentifier: makeStableName(bankTransactionCategories.payrollContractors.stableName),
    name: bankTransactionCategories.payrollContractors.displayName,
  },
  {
    accountIdentifier: makeAccountId(bankTransactionCategories.otherBusinessExpenses.id),
    name: bankTransactionCategories.otherBusinessExpenses.displayName,
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

const baseP2PCounterpartyAskTask: P2PCounterpartyAskTask = {
  id: '00000000-0000-4000-8000-000000000951',
  status: BusinessTaskStatus.Todo,
  taskType: P2P_COUNTERPARTY_ASK_TASK_TYPE,
  title: 'Payments to Jane Doe via Venmo',
  question: 'In January, you paid Jane Doe via Venmo $85.00. What was this payment for?',
  p2pCounterparty: {
    id: '00000000-0000-4000-8000-000000000751',
    name: 'Jane Doe',
    provider: { id: '00000000-0000-4000-8000-000000000761', name: 'Venmo' },
  },
  suggestions: P2P_SUGGESTIONS,
  transactions: [makeAskTransaction({ id: '00000000-0000-4000-8000-000000000b01', month: 1, day: 6, amount: 8500, counterpartyName: 'Jane Doe', description: 'VENMO PAYMENT JANE DOE' })],
  transactionResponses: [],
  userResponse: null,
  responseAccount: null,
  totalCount: 1,
  totalAmount: 8500,
  alwaysThis: false,
  resolvedByTaskId: null,
}

const { make: makeBaseP2PCounterpartyAskTask } = createFixtureFactory(baseP2PCounterpartyAskTask)

const toUnansweredResponses = (
  transactions: CounterpartyAskTask['transactions'],
): CounterpartyAskTask['transactionResponses'] =>
  transactions.map(transaction => ({
    transactionId: transaction.id,
    userResponse: null,
    responseAccount: null,
  }))

const withUnansweredResponses = <T extends AnyCounterpartyAskTask>(task: T, overrides?: Partial<T>): T =>
  overrides?.transactionResponses
    ? task
    : { ...task, transactionResponses: toUnansweredResponses(task.transactions) }

export const makeCounterpartyAskTask = (
  overrides?: Partial<CounterpartyAskTask>,
): CounterpartyAskTask => withUnansweredResponses(makeBaseCounterpartyAskTask(overrides), overrides)

export const makeP2PCounterpartyAskTask = (
  overrides?: Partial<P2PCounterpartyAskTask>,
): P2PCounterpartyAskTask => withUnansweredResponses(makeBaseP2PCounterpartyAskTask(overrides), overrides)

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
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a08', month, day: 9, amount: 8400, counterpartyName: 'SQ *NAIL BAR', description: 'SQ *NAIL BAR' }),
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
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a07', month, day: 1, amount: 73674, counterpartyName: 'Brick and Mortar Real Estate Services', description: 'BRICK+MORTAR RE SVCS' }),
    ],
    totalAmount: 73674,
  }),

  9: month => makeCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000911',
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a01', month, day: 14, amount: 30774, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' }),
    ],
  }),

  10: month => makeCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000912',
    question: 'You spent $836.45 at Costco across 2 transactions. '
      + 'Can you tell us a bit more about what these were for?',
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a02', month, day: 3, amount: 61250, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' }),
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a03', month, day: 19, amount: 22395, counterpartyName: 'Costco', description: 'COSTCO GAS #1042' }),
    ],
    totalCount: 2,
    totalAmount: 83645,
  }),

  11: month => makeCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000913',
    question: '3 more Costco transactions came in, totaling $297.48. '
      + 'Can you tell us a bit more about what these were for?',
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a04', month, day: 2, amount: 14899, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' }),
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a05', month, day: 11, amount: 9932, counterpartyName: 'Costco', description: 'COSTCO WHSE #1042' }),
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000a06', month, day: 27, amount: 4917, counterpartyName: 'Costco', description: 'COSTCO GAS #1042' }),
    ],
    totalCount: 3,
    totalAmount: 29748,
  }),
}

const P2P_COUNTERPARTY_ASK_SEEDS_BY_MONTH: Record<number, (month: number) => P2PCounterpartyAskTask> = {
  9: month => makeP2PCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000959',
    question: 'In September, you paid Jane Doe via Venmo $85.00. What was this payment for?',
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000b02', month, day: 12, amount: 8500, counterpartyName: 'Jane Doe', description: 'VENMO PAYMENT JANE DOE' }),
    ],
  }),

  10: month => makeP2PCounterpartyAskTask({
    id: '00000000-0000-4000-8000-000000000960',
    question: 'In October, you paid Jane Doe via Venmo $420.00 across 2 payments. What were these payments for?',
    transactions: [
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000b03', month, day: 4, amount: 25000, counterpartyName: 'Jane Doe', description: 'VENMO PAYMENT JANE DOE' }),
      makeAskTransaction({ id: '00000000-0000-4000-8000-000000000b04', month, day: 21, amount: 17000, counterpartyName: 'Jane Doe', description: 'VENMO PAYMENT JANE DOE' }),
    ],
    totalCount: 2,
    totalAmount: 42000,
  }),
}

export const makeCounterpartyAskTasks = (year: number, month: number): AnyCounterpartyAskTask[] => {
  if (year !== FIXTURE_YEAR) return []

  const purchaseSeed = COUNTERPARTY_ASK_SEEDS_BY_MONTH[month]
  const p2pSeed = P2P_COUNTERPARTY_ASK_SEEDS_BY_MONTH[month]

  return [
    ...(p2pSeed ? [p2pSeed(month)] : []),
    ...(purchaseSeed ? [purchaseSeed(month)] : []),
  ]
}

export const counterpartyAskCountFor = (year: number, month: number) =>
  makeCounterpartyAskTasks(year, month).length

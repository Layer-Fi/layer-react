import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'

import { makeCounterpartyAskTask } from '@fixtures/bookkeeping/counterpartyAskTasks'

export const makeFallbackCounterpartyAskTask = (
  id: string,
  overrides?: Partial<CounterpartyAskTask>,
): CounterpartyAskTask =>
  makeCounterpartyAskTask({
    id,
    title: '',
    question: '',
    counterparty: null,
    suggestions: [],
    transactions: [],
    transactionResponses: [],
    totalCount: 0,
    totalAmount: 0,
    ...overrides,
  })

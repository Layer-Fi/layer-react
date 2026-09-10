import { Schema } from 'effect'

import {
  type CounterpartyAskTask,
  CounterpartyAskTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'

const decodeCounterpartyAskTask = Schema.decodeSync(CounterpartyAskTaskSchema)

export const makeFallbackCounterpartyAskTask = (
  id: string,
  overrides?: Partial<CounterpartyAskTask>,
): CounterpartyAskTask => ({
  ...decodeCounterpartyAskTask({
    id,
    status: 'TODO',
    task_type: 'ASK_ABOUT_COUNTERPARTY_FOR_PERIOD',
    title: '',
    question: '',
    counterparty: null,
    user_response: null,
    response_account: null,
    resolved_by_task_id: null,
  }),
  ...overrides,
})

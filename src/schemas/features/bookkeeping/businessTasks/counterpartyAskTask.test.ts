import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { CounterpartyAskTaskSchema } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'

const decode = Schema.decodeUnknownSync(CounterpartyAskTaskSchema)

const baseEncodedAsk = {
  id: '00000000-0000-4000-8000-000000000901',
  status: 'TODO',
  task_type: 'ASK_ABOUT_COUNTERPARTY_FOR_PERIOD',
  title: 'Costco purchases',
  question: 'You spent $307.74 at Costco across 1 transaction.',
  counterparty: null,
  user_response: null,
  response_account: null,
  resolved_by_task_id: null,
}

describe('CounterpartyAskTaskSchema', () => {
  it('decodes an ask whose optional fields are absent', () => {
    const task = decode(baseEncodedAsk)

    expect(task.suggestions).toEqual([])
    expect(task.transactions).toEqual([])
    expect(task.transactionResponses).toEqual([])
    expect(task.totalCount).toBe(0)
    expect(task.totalAmount).toBe(0)
    expect(task.alwaysThis).toBe(false)
  })

  it('decodes an ask whose optional fields are explicitly null', () => {
    const task = decode({
      ...baseEncodedAsk,
      suggestions: null,
      transactions: null,
      transaction_responses: null,
      total_count: null,
      total_amount: null,
      always_this: null,
    })

    expect(task.suggestions).toEqual([])
    expect(task.transactions).toEqual([])
    expect(task.transactionResponses).toEqual([])
    expect(task.totalCount).toBe(0)
    expect(task.totalAmount).toBe(0)
    expect(task.alwaysThis).toBe(false)
  })

  it('rejects a task_type belonging to the legacy arm', () => {
    expect(() => decode({ ...baseEncodedAsk, task_type: 'FREE_RESPONSE_TASK' })).toThrow()
  })
})

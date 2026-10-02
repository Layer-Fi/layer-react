import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { P2PCounterpartyAskTaskSchema } from '@schemas/features/bookkeeping/businessTasks/p2pCounterpartyAskTask'

const decode = Schema.decodeUnknownSync(P2PCounterpartyAskTaskSchema)

const baseEncodedAsk = {
  id: '00000000-0000-4000-8000-000000000951',
  status: 'TODO',
  task_type: 'ASK_ABOUT_P2P_COUNTERPARTY_FOR_PERIOD',
  title: 'Payments to Jane Doe via Venmo',
  question: 'In March, you paid Jane Doe via Venmo $85.00. What was this payment for?',
  p2p_counterparty: {
    id: '00000000-0000-4000-8000-000000000751',
    name: 'Jane Doe',
    provider: { id: '00000000-0000-4000-8000-000000000761', name: 'Venmo' },
  },
  user_response: null,
  response_account: null,
  resolved_by_task_id: null,
}

describe('P2PCounterpartyAskTaskSchema', () => {
  it('decodes the P2P counterparty and its provider', () => {
    const task = decode(baseEncodedAsk)

    expect(task.p2pCounterparty).toEqual({
      id: '00000000-0000-4000-8000-000000000751',
      name: 'Jane Doe',
      provider: { id: '00000000-0000-4000-8000-000000000761', name: 'Venmo' },
    })
    expect(task.suggestions).toEqual([])
  })

  it('decodes an ask whose P2P counterparty is omitted or null', () => {
    const { p2p_counterparty: _p2pCounterparty, ...withoutCounterparty } = baseEncodedAsk

    expect(decode(withoutCounterparty).p2pCounterparty).toBeUndefined()
    expect(decode({ ...baseEncodedAsk, p2p_counterparty: null }).p2pCounterparty).toBeNull()
  })

  it('rejects a malformed P2P counterparty', () => {
    expect(() => decode({ ...baseEncodedAsk, p2p_counterparty: { unexpected: true } })).toThrow()
  })

  it('rejects the purchase ask task_type', () => {
    expect(() => decode({ ...baseEncodedAsk, task_type: 'ASK_ABOUT_COUNTERPARTY_FOR_PERIOD' })).toThrow()
  })
})

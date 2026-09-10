import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import {
  BusinessTaskSchema,
  isCounterpartyAskTask,
  isLegacyBusinessTask,
  isRenderableBusinessTask,
} from '@schemas/features/bookkeeping/businessTask'

const decode = Schema.decodeUnknownSync(BusinessTaskSchema)

const encodedHumanTask = {
  id: '00000000-0000-4000-8000-000000000801',
  status: 'TODO',
  title: 'Upload receipt',
  question: 'What was this for?',
  task_type: 'HUMAN',
  user_response: null,
  user_response_type: 'FREE_RESPONSE',
  documents: null,
}

const encodedCounterpartyAskTask = {
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

// Shape from ApiBusinessTask.AutomatedTask: no question, no user_response_type.
const encodedAutomatedRuleSuggestionTask = {
  id: '00000000-0000-4000-8000-000000000701',
  status: 'TODO',
  title: 'Review rule suggestion for Costco',
  task_type: 'AUTOMATED_RULE_SUGGESTION',
}

// Shape from ApiBusinessTask.AutomatedTransactionReviewTask: no question, no user_response_type.
const encodedAutomatedTransactionReviewTask = {
  id: '00000000-0000-4000-8000-000000000702',
  status: 'TODO',
  title: 'Review Transactions',
  task_type: 'AUTOMATED_TRANSACTION_REVIEW',
}

describe('BusinessTaskSchema', () => {
  it('decodes a legacy human task', () => {
    const task = decode(encodedHumanTask)

    expect(isLegacyBusinessTask(task)).toBe(true)
    expect(isRenderableBusinessTask(task)).toBe(true)
  })

  it('decodes a counterparty ask task', () => {
    const task = decode(encodedCounterpartyAskTask)

    expect(isCounterpartyAskTask(task)).toBe(true)
    expect(isRenderableBusinessTask(task)).toBe(true)
  })

  it('decodes an automated rule-suggestion task as unrenderable instead of throwing', () => {
    const task = decode(encodedAutomatedRuleSuggestionTask)

    expect(isCounterpartyAskTask(task)).toBe(false)
    expect(isLegacyBusinessTask(task)).toBe(false)
    expect(isRenderableBusinessTask(task)).toBe(false)
  })

  it('decodes an automated transaction-review task as unrenderable instead of throwing', () => {
    const task = decode(encodedAutomatedTransactionReviewTask)

    expect(isCounterpartyAskTask(task)).toBe(false)
    expect(isLegacyBusinessTask(task)).toBe(false)
    expect(isRenderableBusinessTask(task)).toBe(false)
  })

  it('does not treat a malformed ask as renderable', () => {
    const malformedAsk = Schema.decodeUnknownSync(BusinessTaskSchema)({
      id: '00000000-0000-4000-8000-0000000009f1',
      status: 'TODO',
      title: 'Costco purchases',
      task_type: 'ASK_ABOUT_COUNTERPARTY_FOR_PERIOD',
    })

    expect(isCounterpartyAskTask(malformedAsk)).toBe(false)
    expect(isRenderableBusinessTask(malformedAsk)).toBe(false)
  })
})

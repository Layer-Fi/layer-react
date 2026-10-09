import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { BusinessTaskSchema, isUnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTask'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

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
  it.each([
    ['a legacy human task', encodedHumanTask],
    ['a counterparty ask task', encodedCounterpartyAskTask],
    ['an automated rule-suggestion task', encodedAutomatedRuleSuggestionTask],
    ['an automated transaction-review task', encodedAutomatedTransactionReviewTask],
  ])('decodes %s as an unknown task instead of throwing', (_, encoded) => {
    expect(isUnifiedAskFormTask(decode(encoded))).toBe(false)
  })

  it('decodes a task whose id and status are missing or unrecognized', () => {
    const task = decode({ id: 'not-a-uuid', task_type: 'SOME_FUTURE_TASK' })

    expect(isUnifiedAskFormTask(task)).toBe(false)
    expect(task.status).toBe(BusinessTaskStatus.Todo)
  })
})

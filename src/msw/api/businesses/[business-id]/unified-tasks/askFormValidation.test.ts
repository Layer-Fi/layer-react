import { describe, expect, it } from 'vitest'

import { AskFormNextPageRequestSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNextPage'
import { UnifiedAskFormSubmissionSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmission'

import { decodeAskFormRequest } from '@msw/api/businesses/[business-id]/unified-tasks/askFormValidation'

const OFFICE = 'acct_0f0b5c1e-1d2a-4c3b-9a8e-111111111111'
const SOFTWARE = 'acct_0f0b5c1e-1d2a-4c3b-9a8e-222222222222'
const TRANSACTION_ID = '7a1c2d3e-4f50-4a6b-8c7d-333333333333'

const statusOf = (decode: () => unknown) => {
  try {
    decode()
    return 200
  }
  catch (thrown) {
    return thrown instanceof Response ? thrown.status : 'not a response'
  }
}

// Mirrors the API's UnifiedAskFormSerializationTest.invalidAnswersAreRejectedAtDeserialization.
const INVALID_SUBMISSIONS: Record<string, unknown> = {
  'choice with text': { answers: { category: { choice: OFFICE, text: 'a different response' } } },
  'follow_up without choice': { answers: { category: { text: 'Snacks', follow_up: { text: 'More' } } } },
  'nested follow_up': { answers: { category: { choice: 'a', follow_up: { choice: 'b', follow_up: { text: 'c' } } } } },
  'unknown shape': { answers: { category: { value: 'a' } } },
  'blank text': { answers: { details: { text: '  ' } } },
  'completed false': { answers: { connect: { completed: false } } },
  'empty transaction answers': { answers: { rows: { transaction_answers: [] } } },
  'duplicate transaction answers': {
    answers: {
      rows: {
        transaction_answers: [
          { transaction_id: TRANSACTION_ID, answer: { choice: OFFICE } },
          { transaction_id: TRANSACTION_ID, answer: { choice: SOFTWARE } },
        ],
      },
    },
  },
  'empty answers': { answers: {} },
  'documents follow_up': { answers: { category: { choice: 'a', follow_up: { document_ids: [TRANSACTION_ID] } } } },
  'empty document ids': { answers: { response: { document_ids: [] } } },
  'transaction row with documents': {
    answers: { rows: { transaction_answers: [{ transaction_id: TRANSACTION_ID, answer: { document_ids: [TRANSACTION_ID] } }] } },
  },
  'acct value without a uuid': { answers: { category: { choice: 'acct_office' } } },
}

describe('decodeAskFormRequest', () => {
  it.each(Object.entries(INVALID_SUBMISSIONS))('rejects %s with a 400', (_case, body) => {
    expect(statusOf(() => decodeAskFormRequest(UnifiedAskFormSubmissionSchema, body))).toBe(400)
  })

  it('accepts the documented counterparty answers', () => {
    expect(statusOf(() => decodeAskFormRequest(UnifiedAskFormSubmissionSchema, {
      answers: {
        category: { choice: 'not_sure', follow_up: { text: 'Snacks for an offsite, I think' } },
        always_this: { choice: 'always' },
      },
    }))).toBe(200)
  })

  it('lets a next-page request carry no answers yet', () => {
    expect(statusOf(() => decodeAskFormRequest(
      AskFormNextPageRequestSchema,
      { page_id: 'how_paid', page_history: ['how_paid'], answers: {} },
      { allowEmptyAnswers: true },
    ))).toBe(200)
  })
})

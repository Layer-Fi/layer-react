import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { AskFormNextPageRequestSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNextPage'
import { UnifiedAskFormSubmissionSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmission'

const decodeSubmission = Schema.decodeUnknownSync(UnifiedAskFormSubmissionSchema, { onExcessProperty: 'error' })

const OFFICE = 'acct_0f0b5c1e-1d2a-4c3b-9a8e-111111111111'
const SOFTWARE = 'acct_0f0b5c1e-1d2a-4c3b-9a8e-222222222222'
const TRANSACTION_ID = '7a1c2d3e-4f50-4a6b-8c7d-333333333333'

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

describe('UnifiedAskFormSubmissionSchema', () => {
  it.each(Object.entries(INVALID_SUBMISSIONS))('rejects %s', (_case, body) => {
    expect(() => decodeSubmission(body)).toThrow()
  })

  it('accepts the documented counterparty answers', () => {
    expect(() => decodeSubmission({
      answers: {
        category: { choice: 'not_sure', follow_up: { text: 'Snacks for an offsite, I think' } },
        always_this: { choice: 'always' },
      },
    })).not.toThrow()
  })

  it('lets a next-page request carry no answers yet', () => {
    expect(() => Schema.decodeUnknownSync(AskFormNextPageRequestSchema, { onExcessProperty: 'error' })({
      page_id: 'how_paid',
      page_history: ['how_paid'],
      answers: {},
    })).not.toThrow()
  })
})

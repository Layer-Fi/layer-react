import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import {
  BusinessTaskSchema,
  isLegacyBusinessTask,
  isUnifiedAskFormTask,
} from '@schemas/features/bookkeeping/businessTask'
import { AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormNextPageResultSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNextPage'
import { AskFormCategoryScope, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { UnifiedAskFormSubmissionSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmission'
import { UnifiedAskFormTaskSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

const decodeTask = Schema.decodeUnknownSync(UnifiedAskFormTaskSchema)
const decodeBusinessTask = Schema.decodeUnknownSync(BusinessTaskSchema)
const encodeSubmission = Schema.encodeSync(UnifiedAskFormSubmissionSchema)

// The API's JSON config omits defaulted fields (auto_advance, search, scope, an option's next
// and follow_up) and writes nullable ones as explicit nulls.
const encodedCounterpartyTask = {
  type: 'Unified_Ask_Form_Task',
  id: '00000000-0000-4000-8000-000000000d01',
  task_run_id: null,
  task_type: 'UNIFIED_ASK_FORM',
  form_subtype: 'COUNTERPARTY',
  title: 'Costco purchases',
  question: 'You spent $307.74 at Costco across 2 transactions.',
  status: 'TODO',
  transactions: [
    { id: 'txn-1', date: '2026-05-03T00:00:00Z', amount: -12874, description: 'COSTCO WHSE #0478' },
    { id: 'txn-2', date: '2026-05-19T00:00:00Z', amount: -9650, description: null },
  ],
  form: {
    entry_page_id: 'pick',
    pages: [
      {
        id: 'pick',
        steps: [{
          type: 'CATEGORY',
          id: 'category',
          prompt: 'What were these for?',
          options: [
            { value: 'acct_office', label: 'Office Expenses' },
            { value: 'mix', label: 'It’s a mix or it varies', next: { kind: 'PAGE', page_id: 'itemise' } },
            {
              value: 'not_sure',
              label: 'Something else',
              next: { kind: 'SUBMIT' },
              follow_up: { type: 'TEXT', multiline: true, required: true },
            },
          ],
        }],
        next: { kind: 'PAGE', page_id: 'remember' },
      },
      {
        id: 'itemise',
        steps: [{ type: 'CATEGORY', id: 'rows', scope: 'EACH_TRANSACTION', options: [] }],
        next: { kind: 'SUBMIT' },
      },
      {
        id: 'remember',
        steps: [{ type: 'CHOICE', id: 'always_this', prompt: 'Remember this?', options: [{ value: 'always', label: 'Always' }, { value: 'ask', label: 'Ask me each time' }] }],
        next: { kind: 'SERVER', url: '/v1/businesses/b/unified-tasks/t/next-page?form_version=1' },
      },
    ],
  },
  answers: null,
  answer_summary: null,
  resolution: null,
  period_id: '00000000-0000-4000-8000-000000000e01',
  effective_date: null,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
  user_marked_completed_at: null,
  completed_at: null,
}

const withPage = (index: number, page: Record<string, unknown>) => ({
  ...encodedCounterpartyTask,
  form: {
    ...encodedCounterpartyTask.form,
    pages: encodedCounterpartyTask.form.pages.map((existing, i) => (i === index ? { ...existing, ...page } : existing)),
  },
})

describe('UnifiedAskFormTaskSchema', () => {
  it('decodes a task whose defaulted fields are omitted', () => {
    const task = decodeTask(encodedCounterpartyTask)
    const [pick, itemise] = task.form.pages
    const [categoryStep] = pick?.steps ?? []

    expect(task.form.entryPageId).toBe('pick')
    expect(task.transactions[0]?.date).toEqual(new Date('2026-05-03T00:00:00Z'))
    expect(categoryStep).toMatchObject({ type: AskFormStepType.Category, search: false, scope: AskFormCategoryScope.Task })
    expect(itemise?.steps[0]).toMatchObject({ scope: AskFormCategoryScope.EachTransaction })
    expect(pick?.next).toEqual({ kind: AskFormNextKind.Page, pageId: 'remember' })

    const notSure = categoryStep && 'options' in categoryStep ? categoryStep.options[2] : undefined
    expect(notSure?.next).toEqual({ kind: AskFormNextKind.Submit, review: false })
    expect(notSure?.followUp).toMatchObject({ type: AskFormStepType.Text, multiline: true, required: true })
  })

  it('is matched by the business task union ahead of the legacy arm', () => {
    const task = decodeBusinessTask(encodedCounterpartyTask)

    expect(isUnifiedAskFormTask(task)).toBe(true)
    expect(isLegacyBusinessTask(task)).toBe(false)
  })

  it.each([
    ['step type', withPage(2, { steps: [{ type: 'SOME_FUTURE_KIND', id: 'always_this', prompt: 'Remember this?' }] })],
    ['next kind', withPage(2, { next: { kind: 'SOME_FUTURE_KIND' } })],
    ['action', withPage(2, { steps: [{ type: 'ACTION', id: 'always_this', prompt: 'Connect', action: 'CONNECT_PAYROLL' }] })],
    ['category scope', withPage(1, { steps: [{ type: 'CATEGORY', id: 'rows', scope: 'EACH_VENDOR' }] })],
    ['echoed answer shape', { ...encodedCounterpartyTask, answers: { category: { rating: 5 } } }],
    ['form', { ...encodedCounterpartyTask, form: null, user_response_type: 'FREE_RESPONSE' }],
  ])('hides the task when it has an unrecognised %s', (_, payload) => {
    const task = decodeBusinessTask(payload)

    expect(isUnifiedAskFormTask(task)).toBe(false)
    expect(isLegacyBusinessTask(task)).toBe(false)
  })

  it.each([
    ['search entity', withPage(2, { steps: [{ type: 'SEARCH', id: 'always_this', entity: 'EMPLOYEE' }] })],
    ['form subtype', { ...encodedCounterpartyTask, form_subtype: 'SOMETHING_NEW' }],
  ])('still shows the task when it has an unrecognised %s', (_, payload) => {
    expect(isUnifiedAskFormTask(decodeBusinessTask(payload))).toBe(true)
  })

  it('decodes answers echoed back on an answered task', () => {
    const task = decodeTask({
      ...encodedCounterpartyTask,
      answers: {
        category: { choice: 'not_sure', follow_up: { text: 'Snacks for an offsite' } },
      },
      answer_summary: 'Snacks for an offsite',
    })

    expect(task.answers?.category).toEqual({ choice: 'not_sure', followUp: { text: 'Snacks for an offsite' } })
    expect(task.answerSummary).toBe('Snacks for an offsite')
  })

  it('decodes an echoed answer whose follow_up is null', () => {
    const task = decodeTask({
      ...encodedCounterpartyTask,
      answers: {
        category: { choice: 'acct_office', follow_up: null },
      },
    })

    expect(task.answers?.category).toEqual({ choice: 'acct_office' })
  })
})

describe('AskFormNextPageResultSchema', () => {
  const decodeNextPage = Schema.decodeUnknownSync(AskFormNextPageResultSchema)

  it('decodes the next page or a submit', () => {
    expect(decodeNextPage({ next: { kind: 'PAGE', page_id: 'vendor' } })).toEqual({ next: { kind: AskFormNextKind.Page, pageId: 'vendor' } })
    expect(decodeNextPage({ next: { kind: 'SUBMIT' } })).toEqual({ next: { kind: AskFormNextKind.Submit, review: false } })
  })

  it.each([
    ['a SERVER next', { next: { kind: 'SERVER', url: '/v1/businesses/b/unified-tasks/t/next-page' } }],
    ['a bare page id', { next_page_id: 'vendor' }],
  ])('rejects %s', (_, payload) => {
    expect(() => decodeNextPage(payload)).toThrow()
  })
})

describe('UnifiedAskFormSubmissionSchema', () => {
  it('encodes every answer shape in the API’s wire format', () => {
    expect(encodeSubmission({
      answers: {
        category: { choice: 'mix' },
        rows: {
          transactionAnswers: [
            { transactionId: 'txn-1', answer: { choice: 'acct_office' } },
            { transactionId: 'txn-2', answer: { choice: 'not_sure', followUp: { text: 'Gas' } } },
          ],
        },
        connect: { completed: true },
        upload: { documentIds: ['doc-1'] },
      },
    })).toEqual({
      answers: {
        category: { choice: 'mix' },
        rows: {
          transaction_answers: [
            { transaction_id: 'txn-1', answer: { choice: 'acct_office' } },
            { transaction_id: 'txn-2', answer: { choice: 'not_sure', follow_up: { text: 'Gas' } } },
          ],
        },
        connect: { completed: true },
        upload: { document_ids: ['doc-1'] },
      },
    })
  })
})

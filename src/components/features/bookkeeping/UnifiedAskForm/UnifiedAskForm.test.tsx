import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormAction, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { AskFormResolutionKind, type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { UnifiedAskFormTaskItem } from '@features/bookkeeping/TasksListItem/UnifiedAskFormTaskItem'

import { makeAccountMaskAskForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/accountMask'
import { makeCounterpartyAskForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/counterparty'
import { makeUploadDocumentAskForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/uploadDocument'
import { makeUnifiedAskFormTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { post as postAskFormNextPage } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { post as postUnifiedAskFormResponse } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { post as postUnifiedAskFormUpload } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/upload/post'
import { server } from '@msw/node'
import { readRequestJson } from '@msw/utils/request'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const TRANSACTIONS = [
  { id: 'txn-1', date: new Date('2025-02-03T00:00:00.000Z'), amount: -61250, description: 'COSTCO WHSE' },
  { id: 'txn-2', date: new Date('2025-02-19T00:00:00.000Z'), amount: -22395, description: 'COSTCO GAS' },
]

const OFFICE = 'acct_0f0b5c1e-1d2a-4c3b-9a8e-111111111111'
const MEALS = 'acct_0f0b5c1e-1d2a-4c3b-9a8e-222222222222'

const counterpartyTask = () => makeUnifiedAskFormTask({
  id: '00000000-0000-4000-8000-000000000f01',
  title: 'Costco purchases',
  transactions: TRANSACTIONS,
  form: makeCounterpartyAskForm(
    [{ value: OFFICE, label: 'Office Expenses' }, { value: MEALS, label: 'Business Meals' }],
    {
      pickPrompt: 'You spent $836.45 at Costco. What were these for?',
      rememberPrompt: 'Should we assume your future Costco purchases are {{answer.category.label}} going forward?',
      noun: 'purchase',
    },
  ),
})

const renderItem = (task: UnifiedAskFormTask) => ({
  user: userEvent.setup(),
  ...render(<UnifiedAskFormTaskItem task={task as UserVisibleTask & UnifiedAskFormTask} defaultOpen />, { wrapper: LayerTestProvider }),
})

const uploadFile = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement, fileName: string) => {
  const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')
  if (!fileInput) throw new Error('Expected a file input')
  await user.upload(fileInput, new File(['%PDF'], fileName, { type: 'application/pdf' }))
}

const spyOnSubmit = (task: UnifiedAskFormTask) => {
  const onRequest = vi.fn<(body: unknown, url: string) => void>()

  server.use(
    postUnifiedAskFormResponse.mock({ task, categorized: true }, {
      onRequest: async ({ request }) => {
        onRequest(await readRequestJson(request), request.url)
      },
    }),
  )

  return onRequest
}

describe('UnifiedAskForm', () => {
  it('shows an ask resolved by another period as answered there, with no questions', () => {
    renderItem({
      ...counterpartyTask(),
      status: BusinessTaskStatus.UserMarkedCompleted,
      resolution: { kind: AskFormResolutionKind.ResolvedByTask, taskId: '00000000-0000-4000-8000-000000000f02' },
    })

    expect(screen.getByText('You answered this for every period, so we’ve applied it here too.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument()
  })

  it('fills the remember question from the picked category and posts only the path taken', async () => {
    const task = counterpartyTask()
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Should we assume your future Costco purchases are Business Meals going forward?')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Yes, automatically categorize them' }))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      answers: { category: { choice: MEALS }, always_this: { choice: 'always' } },
    })
    expect(onSubmit.mock.calls[0]?.[1]).toContain('form_version=1')
  })

  it('drops answers from a page the customer backed out of', async () => {
    const task = counterpartyTask()
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Office Expenses' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('radio', { name: 'No, keep asking me about them' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(screen.queryByText(/Should we assume/)).not.toBeInTheDocument())

    await user.click(screen.getByRole('radio', { name: 'It\'s a mix or it varies' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.queryByText(/What were these for/)).not.toBeInTheDocument())

    await user.click(screen.getByRole('radio', { name: 'Office Expenses' }))
    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      answers: {
        category: { choice: 'mix' },
        rows: {
          transaction_answers: [
            { transaction_id: 'txn-1', answer: { choice: OFFICE } },
            { transaction_id: 'txn-2', answer: { choice: MEALS } },
          ],
        },
      },
    })
  })

  it('goes back to the first page after a double press on Next', async () => {
    const task = counterpartyTask()
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Office Expenses' }))
    await user.dblClick(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText(/Should we assume/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))

    await waitFor(() => expect(screen.queryByText(/Should we assume/)).not.toBeInTheDocument())
    expect(screen.getByText('You spent $836.45 at Costco. What were these for?')).toBeInTheDocument()
  })

  it('labels a sheet row with the chosen option instead of the customer\'s free text', async () => {
    const task = counterpartyTask()
    spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'It\'s a mix or it varies' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.queryByText(/What were these for/)).not.toBeInTheDocument())

    await user.click(screen.getByRole('radio', { name: 'Something else' }))
    await user.type(screen.getByRole('textbox'), 'Bulk paper towels for the office')
    await user.click(screen.getByRole('button', { name: /COSTCO GAS/ }))

    expect(screen.getByRole('button', { name: /COSTCO WHSE.*Something else/ })).toBeInTheDocument()
    expect(screen.queryByText('Bulk paper towels for the office')).not.toBeInTheDocument()
  })

  it('reviews a free-text follow-up as its option', async () => {
    const task = makeUnifiedAskFormTask({
      form: {
        entryPageId: 'only',
        pages: [{
          id: 'only',
          next: { kind: AskFormNextKind.Submit, review: true },
          steps: [{
            id: 'kind',
            type: AskFormStepType.Choice,
            prompt: 'What was it?',
            autoAdvance: false,
            options: [
              { value: 'supplies', label: 'Supplies' },
              {
                value: 'other',
                label: 'Something else',
                followUp: { type: AskFormStepType.Text, prompt: null, placeholder: null, multiline: true, required: true },
              },
            ],
          }],
        }],
      },
    })
    spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Something else' }))
    await user.type(screen.getByRole('textbox'), 'Paper towels')
    await user.click(screen.getByRole('button', { name: 'Review' }))

    expect(await screen.findByText('Something else')).toBeInTheDocument()
    expect(screen.queryByText('Paper towels')).not.toBeInTheDocument()
  })

  it('still fills a follow_up template with the customer\'s note', async () => {
    const task = makeUnifiedAskFormTask({
      form: {
        entryPageId: 'first',
        pages: [
          {
            id: 'first',
            next: { kind: AskFormNextKind.Page, pageId: 'second' },
            steps: [{
              id: 'kind',
              type: AskFormStepType.Choice,
              prompt: 'What was it?',
              autoAdvance: false,
              options: [{
                value: 'other',
                label: 'Something else',
                followUp: { type: AskFormStepType.Text, prompt: null, placeholder: null, multiline: true, required: true },
              }],
            }],
          },
          {
            id: 'second',
            next: { kind: AskFormNextKind.Submit, review: false },
            steps: [{
              id: 'confirm',
              type: AskFormStepType.Text,
              prompt: 'You said {{answer.kind.label}}: {{answer.kind.follow_up.label}}. Anything else?',
              placeholder: null,
              multiline: false,
              required: false,
            }],
          },
        ],
      },
    })
    spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Something else' }))
    await user.type(screen.getByRole('textbox'), 'Paper towels')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('You said Something else: Paper towels. Anything else?')).toBeInTheDocument()
  })

  it('asks for text under "Something else" before the remember question', async () => {
    const task = counterpartyTask()
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Something else' }))

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    await user.type(screen.getByRole('textbox'), 'Snacks for an offsite')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('radio', { name: 'No, keep asking me about them' }))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      answers: {
        category: { choice: 'not_sure', follow_up: { text: 'Snacks for an offsite' } },
        always_this: { choice: 'ask' },
      },
    })
  })

  it('posts once when an auto-advancing option is pressed twice', async () => {
    const task = makeUnifiedAskFormTask({
      form: {
        entryPageId: 'only',
        pages: [{
          id: 'only',
          next: { kind: AskFormNextKind.Submit, review: false },
          steps: [{
            id: 'kind',
            type: AskFormStepType.Choice,
            prompt: 'What was it?',
            autoAdvance: true,
            options: [{ value: 'supplies', label: 'Supplies' }],
          }],
        }],
      },
    })
    const onSubmit = vi.fn<() => void>()
    let respond = () => {}
    const response = new Promise<void>((resolve) => {
      respond = resolve
    })
    server.use(postUnifiedAskFormResponse.mock(
      { task: { ...task, answerSummary: 'Office supplies' }, categorized: false },
      {
        onRequest: async () => {
          onSubmit()
          await response
        },
      },
    ))
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Supplies' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await user.click(screen.getByRole('radio', { name: 'Supplies' }))
    respond()

    expect(await screen.findByText('Office supplies')).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('This task has already been answered.')).not.toBeInTheDocument()
  })

  it('lets the server pick the next page and posts the page history to the form’s url', async () => {
    const task = makeUnifiedAskFormTask({
      id: '00000000-0000-4000-8000-000000000f02',
      title: 'Help us identify account ••2691',
      transactions: TRANSACTIONS,
      form: makeAccountMaskAskForm('00000000-0000-4000-8000-000000000f02', '2691'),
    })
    const onNextPage = vi.fn<(body: unknown) => void>()
    server.use(
      postAskFormNextPage.mock({ next: { kind: AskFormNextKind.Page, pageId: 'connect' } }, {
        onRequest: async ({ request }) => {
          onNextPage(await readRequestJson(request))
        },
      }),
    )
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Another account my business owns' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByText('Connect this account so we can pull its transactions for you automatically.')
    expect(onNextPage).toHaveBeenCalledWith({
      page_id: 'account_type',
      page_history: ['account_type'],
      answers: { account_type: { choice: 'owned' } },
    })

    await user.click(screen.getByRole('button', { name: 'Connect account' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      answers: { account_type: { choice: 'owned' }, connect: { completed: true } },
    })
  })

  it('submits a page whose only step is Connect account', async () => {
    const task = makeUnifiedAskFormTask({
      form: {
        entryPageId: 'connect',
        pages: [{
          id: 'connect',
          next: { kind: AskFormNextKind.Submit, review: false },
          steps: [{ id: 'connect', type: AskFormStepType.Action, action: AskFormAction.ConnectAccount, prompt: 'Connect this account.' }],
        }],
      },
    })
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('button', { name: 'Connect account' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ answers: { connect: { completed: true } } })
  })

  it('says the task was already answered when the API rejects a changed answer', async () => {
    const task = makeUnifiedAskFormTask({
      form: {
        entryPageId: 'only',
        pages: [{
          id: 'only',
          next: { kind: AskFormNextKind.Submit, review: false },
          steps: [{ id: 'response', type: AskFormStepType.Text, prompt: 'What was it for?', placeholder: null, multiline: true, required: true }],
        }],
      },
    })
    server.use(
      postUnifiedAskFormResponse.mockError({
        errors: [{
          type: 'InvalidState',
          description: `Task ${task.id} is already resolved`,
          error_enum: 'BusinessTaskAlreadyCompleted',
        }],
      }, { status: 403 }),
    )
    const { user } = renderItem(task)

    await user.type(screen.getByRole('textbox', { name: 'What was it for?' }), 'A client deposit')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText('This task has already been answered.')).toBeInTheDocument()
    expect(screen.queryByText('We couldn’t save that answer. Please try again.')).not.toBeInTheDocument()
  })

  it('asks to try again when the submit fails for any other reason', async () => {
    const task = makeUnifiedAskFormTask({
      form: {
        entryPageId: 'only',
        pages: [{
          id: 'only',
          next: { kind: AskFormNextKind.Submit, review: false },
          steps: [{ id: 'response', type: AskFormStepType.Text, prompt: 'What was it for?', placeholder: null, multiline: true, required: true }],
        }],
      },
    })
    server.use(
      postUnifiedAskFormResponse.mockError({ errors: [{ type: 'BadRequest', description: 'nope', error_enum: 'SpecifiedBadRequest' }] }, { status: 400 }),
    )
    const { user } = renderItem(task)

    await user.type(screen.getByRole('textbox', { name: 'What was it for?' }), 'A client deposit')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText('We couldn’t save that answer. Please try again.')).toBeInTheDocument()
  })

  it('submits only the files still listed after one is removed', async () => {
    const task = makeUnifiedAskFormTask({ form: makeUploadDocumentAskForm('Upload your receipt') })
    const keptId = '00000000-0000-4000-8000-00000000d0c1'
    const onSubmit = spyOnSubmit(task)
    const { user, container } = renderItem(task)

    server.use(postUnifiedAskFormUpload.mock({ documents: [{ id: keptId, fileName: 'receipt.pdf' }] }))
    await uploadFile(user, container, 'receipt.pdf')
    expect(await screen.findByText('receipt.pdf')).toBeInTheDocument()

    server.use(postUnifiedAskFormUpload.mock({ documents: [{ id: '00000000-0000-4000-8000-00000000d0c2', fileName: 'invoice.pdf' }] }))
    await uploadFile(user, container, 'invoice.pdf')
    expect(await screen.findByText('invoice.pdf')).toBeInTheDocument()

    const [, removeInvoice] = screen.getAllByRole('button', { name: 'Remove' })
    if (!removeInvoice) throw new Error('Expected a Remove button for each file')
    await user.click(removeInvoice)
    await waitFor(() => expect(screen.queryByText('invoice.pdf')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ answers: { response: { document_ids: [keptId] } } })
  })

  it('keeps Submit disabled while the only answer is a blank optional text', async () => {
    const { user } = renderItem(makeUnifiedAskFormTask({
      form: {
        entryPageId: 'only',
        pages: [{
          id: 'only',
          next: { kind: AskFormNextKind.Submit, review: false },
          steps: [{ id: 'notes', type: AskFormStepType.Text, prompt: 'Anything else?', placeholder: null, multiline: false, required: false }],
        }],
      },
    }))

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: 'Anything else?' }), 'Paid in cash')

    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()
  })

  it('leaves out an optional text answer the customer cleared', async () => {
    const task = makeUnifiedAskFormTask({
      form: {
        entryPageId: 'only',
        pages: [{
          id: 'only',
          next: { kind: AskFormNextKind.Submit, review: false },
          steps: [
            {
              id: 'kind',
              type: AskFormStepType.Choice,
              prompt: 'What was it?',
              autoAdvance: false,
              options: [{ value: 'supplies', label: 'Supplies' }],
            },
            { id: 'notes', type: AskFormStepType.Text, prompt: 'Anything else?', placeholder: null, multiline: false, required: false },
          ],
        }],
      },
    })
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Supplies' }))
    await user.type(screen.getByRole('textbox', { name: 'Anything else?' }), 'x')
    await user.clear(screen.getByRole('textbox', { name: 'Anything else?' }))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ answers: { kind: { choice: 'supplies' } } })
  })
})

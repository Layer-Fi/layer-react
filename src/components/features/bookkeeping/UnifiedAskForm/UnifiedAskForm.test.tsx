import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type AskFormChoiceAnswer } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormChecklistRequirement, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { AskFormResolutionKind, type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { LinkedAccountsContext, type LinkedAccountsContextType } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { TasksListItem } from '@features/bookkeeping/TasksListItem/TasksListItem'
import { TasksTakeover } from '@features/bookkeeping/TasksTakeover/TasksTakeover'

import { makeAccountMaskAskForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/accountMask'
import { makeConfirmationAskForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/confirmation'
import { makeCounterpartyAskForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/counterparty'
import { makeUploadDocumentAskForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/uploadDocument'
import {
  askFormNextPageUrl,
  checklistStep,
  choiceStep,
  connectAccountStep,
  makeUnifiedAskFormTask,
  page,
  singlePageForm,
  textFollowUp,
  textStep,
} from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { post as postAskFormNextPage } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { post as postUnifiedAskFormResponse } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { del as deleteUnifiedAskFormDocument } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/upload/[document-id]/delete'
import { post as postUnifiedAskFormUpload } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/upload/post'
import { server } from '@msw/node'
import { readRequestJson } from '@msw/utils/request'
import { makeLinkedAccountsContext } from '@testUtils/mocks/linkedAccountsContext'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'
import { spyOnEndpoint } from '@testUtils/requests/spyOnEndpoint'

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

const lockedKindTask = (answer: AskFormChoiceAnswer) => makeUnifiedAskFormTask({
  status: BusinessTaskStatus.UserMarkedCompleted,
  answers: { kind: answer },
  form: singlePageForm(page('only', [{
    ...choiceStep('kind', 'What was it?', [
      { value: 'supplies', label: 'Supplies' },
      { value: 'other', label: 'Something else', followUp: textFollowUp(null) },
    ]),
    editable: false,
  }])),
})

const renderItem = (task: UnifiedAskFormTask, linkedAccounts?: Partial<LinkedAccountsContextType>) => ({
  user: userEvent.setup(),
  ...render(
    <LinkedAccountsContext.Provider value={makeLinkedAccountsContext(linkedAccounts)}>
      <TasksListItem task={task} defaultOpen />
    </LinkedAccountsContext.Provider>,
    { wrapper: LayerTestProvider },
  ),
})

const connectAccountResolving = (isConnected: boolean) => ({ addConnection: vi.fn(() => Promise.resolve(isConnected)) })

const connectOnlyTask = () => makeUnifiedAskFormTask({
  form: singlePageForm(page('connect', [connectAccountStep('connect', 'Connect this account.')])),
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

  it('shows a locked answer without letting the customer change it or its follow-up', () => {
    renderItem(lockedKindTask({ choice: 'other', followUp: { text: 'Paper towels' } }))

    expect(screen.getByRole('radio', { name: 'Something else' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Supplies' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Paper towels')
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('shows a fully locked task in the takeover without Submit', async () => {
    const task = lockedKindTask({ choice: 'supplies' })
    render(<TasksTakeover tasks={[task]} taskId={task.id} onTaskChange={vi.fn()} />, { wrapper: LayerTestProvider })

    expect(await screen.findByRole('radio', { name: 'Supplies' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Supplies' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument()
  })

  it('shows a fully locked task\'s review without Submit when the server routes to it', async () => {
    const taskId = '00000000-0000-4000-8000-000000000f03'
    const task = makeUnifiedAskFormTask({
      id: taskId,
      status: BusinessTaskStatus.UserMarkedCompleted,
      answers: { kind: { choice: 'supplies' } },
      form: singlePageForm(page('only', [{
        ...choiceStep('kind', 'What was it?', [{ value: 'supplies', label: 'Supplies' }]),
        editable: false,
      }], { kind: AskFormNextKind.Server, url: askFormNextPageUrl(taskId) })),
    })
    server.use(postAskFormNextPage.mock({ next: { kind: AskFormNextKind.Submit, review: true } }))
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('Here’s what you told us:')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
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
          steps: [choiceStep('kind', 'What was it?', [
            { value: 'supplies', label: 'Supplies' },
            { value: 'other', label: 'Something else', followUp: textFollowUp(null) },
          ])],
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
            steps: [choiceStep('kind', 'What was it?', [{ value: 'other', label: 'Something else', followUp: textFollowUp(null) }])],
          },
          {
            id: 'second',
            next: { kind: AskFormNextKind.Submit, review: false },
            steps: [textStep(
              'confirm',
              'You said {{answer.kind.label}}: {{answer.kind.follow_up.label}}. Anything else?',
              { multiline: false, required: false },
            )],
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
          steps: [choiceStep('kind', 'What was it?', [{ value: 'supplies', label: 'Supplies' }], { autoAdvance: true })],
        }],
      },
    })
    const onSubmit = vi.fn<() => void>()
    let respond = () => {}
    const response = new Promise<void>((resolve) => {
      respond = resolve
    })
    server.use(postUnifiedAskFormResponse.mock(
      { task, categorized: false },
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

    await waitFor(() => expect(screen.queryByRole('radio', { name: 'Supplies' })).not.toBeInTheDocument())
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
    const { user } = renderItem(task, connectAccountResolving(true))

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

  it('submits Connect account once the account connects', async () => {
    const task = connectOnlyTask()
    const onSubmit = spyOnSubmit(task)
    const linkedAccounts = connectAccountResolving(true)
    const { user } = renderItem(task, linkedAccounts)

    await user.click(screen.getByRole('button', { name: 'Connect account' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(linkedAccounts.addConnection).toHaveBeenCalledExactlyOnceWith('PLAID')
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ answers: { connect: { completed: true } } })
  })

  it('stays on the connect page when the account isn’t connected', async () => {
    const task = connectOnlyTask()
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task, connectAccountResolving(false))

    await user.click(screen.getByRole('button', { name: 'Connect account' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Connect account' })).toBeEnabled())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('retries only the save after a connection whose save failed', async () => {
    const task = connectOnlyTask()
    const linkedAccounts = connectAccountResolving(true)
    server.use(
      postUnifiedAskFormResponse.mockError({ errors: [{ type: 'BadRequest', description: 'nope', error_enum: 'SpecifiedBadRequest' }] }, { status: 400 }),
    )
    const { user } = renderItem(task, linkedAccounts)

    await user.click(screen.getByRole('button', { name: 'Connect account' }))
    expect(await screen.findByText('We couldn’t save that answer. Please try again.')).toBeInTheDocument()

    const onSubmit = spyOnSubmit(task)
    await user.click(screen.getByRole('button', { name: 'Connect account' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(linkedAccounts.addConnection).toHaveBeenCalledOnce()
  })

  it('says the task was already answered when the API rejects a changed answer', async () => {
    const task = makeUnifiedAskFormTask({
      form: {
        entryPageId: 'only',
        pages: [{
          id: 'only',
          next: { kind: AskFormNextKind.Submit, review: false },
          steps: [textStep('response', 'What was it for?')],
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
          steps: [textStep('response', 'What was it for?')],
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

  it('says the task was already answered when the API rejects an upload', async () => {
    const task = makeUnifiedAskFormTask({ form: makeUploadDocumentAskForm('Upload your receipt') })
    server.use(
      postUnifiedAskFormUpload.mockError({
        errors: [{
          type: 'InvalidState',
          description: `Task ${task.id} is already resolved`,
          error_enum: 'BusinessTaskAlreadyCompleted',
        }],
      }, { status: 403 }),
    )
    const { user, container } = renderItem(task)

    await uploadFile(user, container, 'receipt.pdf')

    expect(await screen.findByText('This task has already been answered.')).toBeInTheDocument()
    expect(screen.queryByText('Some files couldn’t be uploaded. Try again.')).not.toBeInTheDocument()
  })

  it('lists the files the task already holds by name', () => {
    const documentId = '00000000-0000-4000-8000-00000000d0c1'

    renderItem(makeUnifiedAskFormTask({
      form: makeUploadDocumentAskForm('Upload your receipt', [{ id: documentId, fileName: 'receipt.pdf' }]),
      answers: { response: { documentIds: [documentId] } },
    }))

    expect(screen.getByText('receipt.pdf')).toBeInTheDocument()
    expect(screen.queryByText(documentId)).not.toBeInTheDocument()
  })

  it.each([
    {
      reason: 'the task was already answered',
      status: 403,
      error: { type: 'InvalidState', description: 'Task is already resolved', error_enum: 'BusinessTaskAlreadyCompleted' },
      toast: 'This task has already been answered.',
    },
    {
      reason: 'the API no longer holds the file',
      status: 404,
      error: { type: 'ResourceNotFound', description: 'Document not found', error_enum: 'SpecifiedIdNotFound' },
      toast: undefined,
    },
  ])('drops the file when its removal is rejected because $reason', async ({ status, error, toast }) => {
    const task = makeUnifiedAskFormTask({ form: makeUploadDocumentAskForm('Upload your receipt') })
    server.use(
      postUnifiedAskFormUpload.mock({ documents: [{ id: '00000000-0000-4000-8000-00000000d0c1', fileName: 'receipt.pdf' }] }),
      deleteUnifiedAskFormDocument.mockError({ errors: [error] }, { status }),
    )
    const { user, container } = renderItem(task)

    await uploadFile(user, container, 'receipt.pdf')
    await user.click(await screen.findByRole('button', { name: 'Remove receipt.pdf' }))

    if (toast) expect(await screen.findByText(toast)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove receipt.pdf' })).not.toBeInTheDocument())
    expect(screen.queryByText('The file couldn’t be removed. Try again.')).not.toBeInTheDocument()
    if (!toast) expect(screen.queryByText('This task has already been answered.')).not.toBeInTheDocument()
  })

  it('deletes a removed file from the task and submits only the files still listed', async () => {
    const task = makeUnifiedAskFormTask({ form: makeUploadDocumentAskForm('Upload your receipt') })
    const keptId = '00000000-0000-4000-8000-00000000d0c1'
    const onSubmit = spyOnSubmit(task)
    const onDelete = spyOnEndpoint(deleteUnifiedAskFormDocument)
    const { user, container } = renderItem(task)

    server.use(postUnifiedAskFormUpload.mock({ documents: [{ id: keptId, fileName: 'receipt.pdf' }] }))
    await uploadFile(user, container, 'receipt.pdf')
    expect(await screen.findByRole('button', { name: 'Remove receipt.pdf' })).toBeInTheDocument()

    server.use(postUnifiedAskFormUpload.mock({ documents: [{ id: '00000000-0000-4000-8000-00000000d0c2', fileName: 'invoice.pdf' }] }))
    await uploadFile(user, container, 'invoice.pdf')

    await user.click(await screen.findByRole('button', { name: 'Remove invoice.pdf' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove invoice.pdf' })).not.toBeInTheDocument())
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete.mock.calls[0]?.[0].params).toMatchObject({ taskId: task.id, documentId: '00000000-0000-4000-8000-00000000d0c2' })

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
          steps: [textStep('notes', 'Anything else?', { multiline: false, required: false })],
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
            choiceStep('kind', 'What was it?', [{ value: 'supplies', label: 'Supplies' }]),
            textStep('notes', 'Anything else?', { multiline: false, required: false }),
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

  it('submits a confirmation only once its box is ticked and Submit is pressed', async () => {
    const task = makeUnifiedAskFormTask({ form: makeConfirmationAskForm('Add Layer as a user in Gusto.') })
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: 'I have completed this task' }))

    expect(onSubmit).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ answers: { confirmation: { checked: ['completed'] } } })
  })

  it('submits a checklist with no required items with nothing checked', async () => {
    const task = makeUnifiedAskFormTask({
      form: singlePageForm(page('only', [checklistStep('extras', 'Anything else?', [
        { value: 'copy', label: 'Email me a copy', required: false },
      ], AskFormChecklistRequirement.Items)])),
    })
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ answers: { extras: { checked: [] } } })
  })

  it('reviews a checklist that requires nothing as None when nothing is ticked', async () => {
    const task = makeUnifiedAskFormTask({
      form: singlePageForm(page('only', [checklistStep('extras', 'Anything else we should do?', [
        { value: 'copy', label: 'Email me a copy', required: false },
        { value: 'call', label: 'Book a call', required: false },
      ], AskFormChecklistRequirement.None)], { kind: AskFormNextKind.Submit, review: true })),
    })
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    expect(screen.queryByText('Optional')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Review' }))

    expect(await screen.findByText('None')).toBeInTheDocument()
    expect(screen.queryByText(/: No$/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ answers: { extras: { checked: [] } } })
  })

  it('reviews a checklist with optional items as yes or no for every item', async () => {
    const { user } = renderItem(makeUnifiedAskFormTask({
      form: singlePageForm(page('only', [checklistStep('close', 'Before we close the month', [
        { value: 'figures', label: 'The figures are right', required: true },
        { value: 'marketing', label: 'Allow marketing emails', required: false },
      ], AskFormChecklistRequirement.Items)], { kind: AskFormNextKind.Submit, review: true })),
    }))

    await user.click(screen.getByRole('checkbox', { name: 'The figures are right' }))
    await user.click(screen.getByRole('button', { name: 'Review' }))

    const answers = await screen.findByRole('list')
    expect(within(answers).getAllByRole('listitem').map(item => item.textContent)).toEqual([
      'The figures are right: Yes',
      'Allow marketing emails: No',
    ])
  })

  it('submits a checklist once its required items are ticked, leaving optional ones out', async () => {
    const task = makeUnifiedAskFormTask({
      form: singlePageForm(page('only', [checklistStep('review', 'Before we close the month', [
        { value: 'figures', label: 'The figures are right', required: true },
        { value: 'copy', label: 'Email me a copy', required: false },
      ], AskFormChecklistRequirement.Items)])),
    })
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('checkbox', { name: 'Email me a copy Optional' }))

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: 'Email me a copy Optional' }))
    await user.click(screen.getByRole('checkbox', { name: 'The figures are right' }))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ answers: { review: { checked: ['figures'] } } })
  })

  it('asks a checklist follow-up under the option that has one and posts it with the choice', async () => {
    const task = makeUnifiedAskFormTask({
      form: singlePageForm(page('only', [choiceStep('payroll', 'Did you set up payroll?', [
        { value: 'no', label: 'Not yet' },
        {
          value: 'yes',
          label: 'Yes',
          followUp: {
            type: AskFormStepType.Checklist,
            prompt: 'Which did you do?',
            items: [{ value: 'gusto', label: 'Added Layer to Gusto', required: false }, { value: 'bank', label: 'Linked the payroll account', required: false }],
            require: AskFormChecklistRequirement.AtLeastOne,
          },
        },
      ])])),
    })
    const onSubmit = spyOnSubmit(task)
    const { user } = renderItem(task)

    await user.click(screen.getByRole('radio', { name: 'Yes' }))

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: 'Linked the payroll account' }))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ answers: { payroll: { choice: 'yes', follow_up: { checked: ['bank'] } } } })
  })
})

import { type PropsWithChildren } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { CounterpartyAskTaskBody } from '@features/bookkeeping/TasksListItem/CounterpartyAskTaskBody'

import { makeCounterpartyAskTask } from '@fixtures/bookkeeping/counterpartyAskTasks'
import { post as postCounterpartyAskResponse } from '@msw/api/businesses/[business-id]/tasks/[task-id]/counterparty-ask-response/post'
import { server } from '@msw/node'
import { readRequestJson } from '@msw/utils/request'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const OFFICE_EXPENSES_ACCOUNT_ID = '00000000-0000-4000-8000-000000000801'
const MEALS_STABLE_NAME = 'MEALS'

const TWO_TRANSACTIONS = [
  {
    id: 'txn-1',
    date: new Date('2025-02-03T00:00:00.000Z'),
    amount: 61250,
    description: 'COSTCO WHSE #1042',
  },
  {
    id: 'txn-2',
    date: new Date('2025-02-19T00:00:00.000Z'),
    amount: 22395,
    description: 'COSTCO GAS #1042',
  },
]

const renderBody = (overrides: Partial<CounterpartyAskTask> = {}, onTransactionCategorized?: () => void) => {
  const task = makeCounterpartyAskTask(overrides) as UserVisibleTask & CounterpartyAskTask

  const wrapper = ({ children }: PropsWithChildren) => (
    <LayerTestProvider eventCallbacks={onTransactionCategorized ? { onTransactionCategorized } : undefined}>
      {children}
    </LayerTestProvider>
  )

  return {
    user: userEvent.setup(),
    ...render(<CounterpartyAskTaskBody task={task} />, { wrapper }),
  }
}

const makeMultiTransactionTask = (): Partial<CounterpartyAskTask> => ({
  transactions: TWO_TRANSACTIONS.map(transaction => ({
    ...transaction,
    direction: 'DEBIT',
    counterpartyName: 'Costco',
  })) as CounterpartyAskTask['transactions'],
  totalCount: 2,
})

const spyOnAskResponse = () => {
  const onRequest = vi.fn<(body: unknown) => void>()

  server.use(
    postCounterpartyAskResponse.mock(makeCounterpartyAskTask(), {
      onRequest: async ({ request }) => {
        onRequest(await readRequestJson(request))
      },
    }),
  )

  return onRequest
}

describe('CounterpartyAskTaskBody', () => {
  it('renders the server-rendered question verbatim', () => {
    renderBody({ question: 'You spent $307.74 at Costco across 1 transaction. What for?' })

    expect(
      screen.getByText('You spent $307.74 at Costco across 1 transaction. What for?'),
    ).toBeInTheDocument()
  })

  it('blocks Continue until an answer is given', async () => {
    const { user } = renderBody()

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))

    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('keeps Continue disabled while free text is blank', async () => {
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Something else' }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await user.type(screen.getByRole('textbox'), '   ')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await user.type(screen.getByRole('textbox'), 'Packaging supplies')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('persists nothing until the always question is answered', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Will Costco purchases always be Business Meals?')).toBeInTheDocument()
    expect(onRequest).not.toHaveBeenCalled()
  })

  it('submits a chip answer with always_this once confirmed', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Yes, always' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onRequest.mock.calls[0]?.[0]).toEqual({
      account_identifier: { type: 'StableName', stable_name: MEALS_STABLE_NAME },
      always_this: true,
    })
  })

  it('notifies the host app when a chip answer categorizes a transaction', async () => {
    spyOnAskResponse()
    const onTransactionCategorized = vi.fn()
    const { user } = renderBody({}, onTransactionCategorized)

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Yes, always' }))

    await waitFor(() => expect(onTransactionCategorized).toHaveBeenCalledTimes(1))
  })

  it('does not notify the host app for a free-text answer', async () => {
    const onRequest = spyOnAskResponse()
    const onTransactionCategorized = vi.fn()
    const { user } = renderBody({}, onTransactionCategorized)

    await user.click(screen.getByRole('radio', { name: 'Something else' }))
    await user.type(screen.getByRole('textbox'), 'Gift for a client')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Yes, always' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onTransactionCategorized).not.toHaveBeenCalled()
  })

  it('submits always_this false when the owner declines the rule', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Office Expenses' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'No, ask me again' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onRequest.mock.calls[0]?.[0]).toEqual({
      account_identifier: { type: 'AccountId', id: OFFICE_EXPENSES_ACCOUNT_ID },
      always_this: false,
    })
  })

  it('goes back to the answer step with the previous choice still selected', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText('Will Costco purchases always be Business Meals?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('radio', { name: 'Business Meals' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    expect(onRequest).not.toHaveBeenCalled()
  })

  it('locks the whole confirm step while the answer is in flight', async () => {
    server.use(
      postCounterpartyAskResponse.mock(makeCounterpartyAskTask(), {
        onRequest: () => new Promise(resolve => setTimeout(resolve, 500)),
      }),
    )
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Yes, always' }))

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Yes, always' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'No, ask me again' })).toBeDisabled()
  })

  it('hides the mix option when there is only one transaction', () => {
    renderBody()

    expect(screen.queryByRole('radio', { name: 'A mix of the above' })).not.toBeInTheDocument()
  })

  it('requires every transaction to be answered before an itemised submit', async () => {
    const { user } = renderBody(makeMultiTransactionTask())

    await user.click(screen.getByRole('radio', { name: 'A mix of the above' }))
    expect(screen.getByText('0 of 2 answered')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    const rowGroups = screen.getAllByRole('radiogroup', { name: 'What this one was for' })
    await user.click(within(rowGroups[0]!).getByRole('radio', { name: 'Business Meals' }))

    expect(screen.getByText('1 of 2 answered')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await user.click(within(rowGroups[1]!).getByRole('radio', { name: 'Office Expenses' }))

    expect(screen.getByText('All 2 answered')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('submits differing per-transaction answers itemised, skipping the always question', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody(makeMultiTransactionTask())

    await user.click(screen.getByRole('radio', { name: 'A mix of the above' }))

    const rowGroups = screen.getAllByRole('radiogroup', { name: 'What this one was for' })
    await user.click(within(rowGroups[0]!).getByRole('radio', { name: 'Business Meals' }))
    await user.click(within(rowGroups[1]!).getByRole('radio', { name: 'Office Expenses' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onRequest.mock.calls[0]?.[0]).toEqual({
      transaction_responses: [
        { transaction_id: 'txn-1', account_identifier: { type: 'StableName', stable_name: MEALS_STABLE_NAME } },
        { transaction_id: 'txn-2', account_identifier: { type: 'AccountId', id: OFFICE_EXPENSES_ACCOUNT_ID } },
      ],
    })
  })

  it('notifies the host app when an itemised mix categorizes a transaction', async () => {
    spyOnAskResponse()
    const onTransactionCategorized = vi.fn()
    const { user } = renderBody(makeMultiTransactionTask(), onTransactionCategorized)

    await user.click(screen.getByRole('radio', { name: 'A mix of the above' }))

    const rowGroups = screen.getAllByRole('radiogroup', { name: 'What this one was for' })
    await user.click(within(rowGroups[0]!).getByRole('radio', { name: 'Business Meals' }))
    await user.click(within(rowGroups[1]!).getByRole('radio', { name: 'Office Expenses' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(onTransactionCategorized).toHaveBeenCalledTimes(1))
  })

  it('collapses a uniform mix into an all-same answer so it can still create a rule', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody(makeMultiTransactionTask())

    await user.click(screen.getByRole('radio', { name: 'A mix of the above' }))

    const rowGroups = screen.getAllByRole('radiogroup', { name: 'What this one was for' })
    await user.click(within(rowGroups[0]!).getByRole('radio', { name: 'Business Meals' }))
    await user.click(within(rowGroups[1]!).getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Will Costco purchases always be Business Meals?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Yes, always' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onRequest.mock.calls[0]?.[0]).toEqual({
      account_identifier: { type: 'StableName', stable_name: MEALS_STABLE_NAME },
      always_this: true,
    })
  })

  it('offers free text only when the API sent no suggestions', () => {
    renderBody({ suggestions: [] })

    expect(screen.getByRole('radio', { name: 'Something else' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(1)
  })

  it('stays answerable when the link rows carry no answers yet', () => {
    renderBody(makeMultiTransactionTask())

    expect(screen.queryByText('Answered')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Business Meals' })).toBeInTheDocument()
  })

  it('renders as answered once a link row carries an answer', () => {
    renderBody({
      ...makeMultiTransactionTask(),
      transactionResponses: [
        { transactionId: 'txn-1', userResponse: 'Gift for a client', responseAccount: null },
        { transactionId: 'txn-2', userResponse: null, responseAccount: null },
      ],
    })

    expect(screen.getByText('Answered')).toBeInTheDocument()
    expect(screen.getByText('You answered 1 of 2 individually.')).toBeInTheDocument()
  })

  it('renders an ask resolved by another period as already answered', () => {
    renderBody({ resolvedByTaskId: '00000000-0000-4000-8000-000000000999' })

    expect(screen.getByText('Already answered')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })
})

import { useState } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { makeAccountId } from '@schemas/common/accountIdentifier'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import {
  type CounterpartyAskBackAction,
  CounterpartyAskTaskBody,
} from '@features/bookkeeping/TasksListItem/CounterpartyAskTaskBody'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { makeCounterpartyAskTask } from '@fixtures/bookkeeping/counterpartyAskTasks'
import { post as postCounterpartyAskResponse } from '@msw/api/businesses/[business-id]/tasks/[task-id]/counterparty-ask-response/post'
import { server } from '@msw/node'
import { readRequestJson } from '@msw/utils/request'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const MEALS_STABLE_NAME = bankTransactionCategories.meals.stableName
const OFFICE_ACCOUNT_ID = bankTransactionCategories.officeExpenses.id

const TWO_TRANSACTIONS = [
  { id: 'txn-1', date: new Date('2025-02-03T00:00:00.000Z'), amount: 61250, description: 'COSTCO WHSE' },
  { id: 'txn-2', date: new Date('2025-02-19T00:00:00.000Z'), amount: 22395, description: 'COSTCO GAS' },
]

const multiTransactionTask = (): Partial<CounterpartyAskTask> => ({
  transactions: TWO_TRANSACTIONS.map(transaction => ({
    ...transaction,
    direction: 'DEBIT',
    counterpartyName: 'Costco',
  })) as CounterpartyAskTask['transactions'],
  transactionResponses: TWO_TRANSACTIONS.map(transaction => ({
    transactionId: transaction.id,
    userResponse: null,
    responseAccount: null,
  })),
  totalCount: 2,
})

type AskHostProps = {
  task: UserVisibleTask & CounterpartyAskTask
  onAnswered?: () => void
}

const AskHost = ({ task, onAnswered = () => {} }: AskHostProps) => {
  const [backAction, setBackAction] = useState<CounterpartyAskBackAction | null>(null)

  return (
    <>
      {backAction
        ? (
          <button type='button' disabled={backAction.isDisabled} onClick={backAction.onBack}>
            Back
          </button>
        )
        : null}
      <CounterpartyAskTaskBody
        task={task}
        counterpartyName='Costco'
        onAnsweredLabelChange={vi.fn()}
        onAnswered={onAnswered}
        onBackActionChange={setBackAction}
      />
    </>
  )
}

const answeredWithAccount = (): Partial<CounterpartyAskTask> => ({
  status: BusinessTaskStatus.UserMarkedCompleted,
  alwaysThis: true,
  responseAccount: {
    accountIdentifier: makeAccountId(OFFICE_ACCOUNT_ID),
    name: 'Office Expenses',
  },
})

const renderBody = (overrides: Partial<CounterpartyAskTask> = {}, onAnswered?: () => void) => {
  const task = makeCounterpartyAskTask(overrides) as UserVisibleTask & CounterpartyAskTask

  return {
    user: userEvent.setup(),
    ...render(<AskHost task={task} onAnswered={onAnswered} />, { wrapper: LayerTestProvider }),
  }
}

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
  it('offers the suggestions plus both escape hatches', () => {
    renderBody(multiTransactionTask())

    expect(screen.getByRole('radio', { name: 'Business Meals' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Something else/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Multiple different things/ })).toBeInTheDocument()
  })

  it('hides the itemised escape when there is only one transaction', () => {
    renderBody()

    expect(screen.queryByRole('radio', { name: /Multiple different things/ })).not.toBeInTheDocument()
  })

  it('goes straight from a suggestion to the going-forward question, with no submit', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))

    expect(screen.getByText(/Should we assume your future Costco purchases/)).toBeInTheDocument()
    expect(onRequest).not.toHaveBeenCalled()
  })

  it('submits always_this true from the going-forward question', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('radio', { name: 'Yes, automatically categorize them' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onRequest.mock.calls[0]?.[0]).toEqual({
      account_identifier: { type: 'StableName', stable_name: MEALS_STABLE_NAME },
      always_this: true,
    })
  })

  it('submits always_this false when the owner declines', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Office Expenses' }))
    await user.click(screen.getByRole('radio', { name: 'No, keep asking me about them' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onRequest.mock.calls[0]?.[0]).toEqual({
      account_identifier: { type: 'AccountId', id: OFFICE_ACCOUNT_ID },
      always_this: false,
    })
  })

  it('takes free text to its own sheet, gated on non-blank input', async () => {
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: /Something else/ }))

    const save = screen.getByRole('button', { name: 'Save' })
    expect(save).toBeDisabled()

    await user.type(screen.getByRole('textbox'), '   ')
    expect(save).toBeDisabled()

    await user.type(screen.getByRole('textbox'), 'Packaging supplies')
    expect(save).toBeEnabled()

    await user.click(save)
    expect(screen.getByText(/Should we assume your future Costco purchases/)).toBeInTheDocument()
  })

  it('returns to the picker from the going-forward question', async () => {
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('radio', { name: /Something else/ })).toBeInTheDocument()
  })

  it('clears the selection on the way back so the same answer can be picked again', async () => {
    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))

    const meals = screen.getByRole('radio', { name: 'Business Meals' })
    expect(meals).not.toBeChecked()

    await user.click(meals)

    expect(screen.getByText(/Should we assume your future Costco purchases/)).toBeInTheDocument()
  })

  it('offers no back action on the picker', () => {
    renderBody()

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('steps back from the going-forward question to the itemised sheet, not the picker', async () => {
    const { user } = renderBody(multiTransactionTask())

    await user.click(screen.getByRole('radio', { name: /Multiple different things/ }))

    const firstRow = screen.getByRole('radiogroup', { name: 'What this one was for' })
    await user.click(within(firstRow).getByRole('radio', { name: 'Business Meals' }))
    const secondRow = screen.getByRole('radiogroup', { name: 'What this one was for' })
    await user.click(within(secondRow).getByRole('radio', { name: 'Business Meals' }))

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText(/Should we assume your future Costco purchases/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByText('All 2 answered')).toBeInTheDocument()
  })

  it('opens one itemised row at a time and advances on answer', async () => {
    const { user } = renderBody(multiTransactionTask())

    await user.click(screen.getByRole('radio', { name: /Multiple different things/ }))

    expect(screen.getByText('0 of 2 answered')).toBeInTheDocument()
    expect(screen.getAllByRole('radiogroup', { name: 'What this one was for' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    const firstRow = screen.getByRole('radiogroup', { name: 'What this one was for' })
    await user.click(within(firstRow).getByRole('radio', { name: 'Business Meals' }))

    expect(screen.getByText('1 of 2 answered')).toBeInTheDocument()

    const secondRow = screen.getByRole('radiogroup', { name: 'What this one was for' })
    await user.click(within(secondRow).getByRole('radio', { name: 'Office Expenses' }))

    expect(screen.getByText('All 2 answered')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('submits differing itemised answers without the going-forward question', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody(multiTransactionTask())

    await user.click(screen.getByRole('radio', { name: /Multiple different things/ }))
    await user.click(within(screen.getByRole('radiogroup', { name: 'What this one was for' }))
      .getByRole('radio', { name: 'Business Meals' }))
    await user.click(within(screen.getByRole('radiogroup', { name: 'What this one was for' }))
      .getByRole('radio', { name: 'Office Expenses' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onRequest.mock.calls[0]?.[0]).toEqual({
      transaction_responses: [
        { transaction_id: 'txn-1', account_identifier: { type: 'StableName', stable_name: MEALS_STABLE_NAME } },
        { transaction_id: 'txn-2', account_identifier: { type: 'AccountId', id: OFFICE_ACCOUNT_ID } },
      ],
    })
  })

  it('collapses a uniform itemised answer so it still reaches the going-forward question', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody(multiTransactionTask())

    await user.click(screen.getByRole('radio', { name: /Multiple different things/ }))
    await user.click(within(screen.getByRole('radiogroup', { name: 'What this one was for' }))
      .getByRole('radio', { name: 'Business Meals' }))
    await user.click(within(screen.getByRole('radiogroup', { name: 'What this one was for' }))
      .getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText(/Should we assume your future Costco purchases/)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Yes, automatically categorize them' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onRequest.mock.calls[0]?.[0]).toEqual({
      account_identifier: { type: 'StableName', stable_name: MEALS_STABLE_NAME },
      always_this: true,
    })
  })

  it('stays answerable when the link rows carry no answers yet', () => {
    renderBody(multiTransactionTask())

    expect(screen.queryByText('Answered')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Business Meals' })).toBeInTheDocument()
  })

  it('explains an ask resolved by another period instead of offering the picker', () => {
    renderBody({
      ...answeredWithAccount(),
      resolvedByTaskId: '00000000-0000-4000-8000-000000000902',
    })

    expect(screen.getByText(/You answered this for every period/)).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('reopens with the previous answer selected and re-enters the flow from it', async () => {
    const { user } = renderBody(answeredWithAccount())

    expect(screen.getByRole('radio', { name: 'Office Expenses' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Office Expenses' }))

    expect(screen.getByText(/Should we assume your future Costco purchases are Office Expenses/))
      .toBeInTheDocument()
  })

  it('submits a replacement answer from the picker', async () => {
    const onRequest = spyOnAskResponse()
    const { user } = renderBody(answeredWithAccount())

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('radio', { name: 'Yes, automatically categorize them' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
    expect(onRequest.mock.calls[0]?.[0]).toEqual({
      account_identifier: { type: 'StableName', stable_name: MEALS_STABLE_NAME },
      always_this: true,
    })
  })

  it('seeds the free text from the previous typed answer', async () => {
    const { user } = renderBody({
      status: BusinessTaskStatus.UserMarkedCompleted,
      userResponse: 'Gas for the van',
    })

    await user.click(screen.getByRole('radio', { name: /Something else/ }))

    expect(screen.getByRole('textbox')).toHaveValue('Gas for the van')
  })

  it('seeds the itemised sheet from the previous per-transaction answers', async () => {
    const { user } = renderBody({
      ...multiTransactionTask(),
      status: BusinessTaskStatus.UserMarkedCompleted,
      transactionResponses: [
        {
          transactionId: 'txn-1',
          userResponse: null,
          responseAccount: {
            accountIdentifier: makeAccountId(OFFICE_ACCOUNT_ID),
            name: 'Office Expenses',
          },
        },
        { transactionId: 'txn-2', userResponse: 'Gas for the van', responseAccount: null },
      ],
    })

    await user.click(screen.getByRole('radio', { name: /Multiple different things/ }))

    expect(screen.getByText('All 2 answered')).toBeInTheDocument()
  })

  it('locks the going-forward answers while the save is in flight', async () => {
    let releaseResponse = () => {}
    const held = new Promise<void>((resolve) => {
      releaseResponse = resolve
    })
    const onRequest = vi.fn()

    server.use(
      postCounterpartyAskResponse.mock(makeCounterpartyAskTask(), {
        onRequest: async () => {
          onRequest()
          await held
        },
      }),
    )

    const { user } = renderBody()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('radio', { name: 'Yes, automatically categorize them' }))

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))

    expect(screen.getByRole('radio', { name: 'No, keep asking me about them' })).toBeDisabled()
    expect(screen.getByText('Saving...')).toBeInTheDocument()

    releaseResponse()

    await waitFor(() => expect(screen.queryByText('Saving...')).not.toBeInTheDocument())
  })

  it('collapses the card and returns to the picker once the answer saves', async () => {
    spyOnAskResponse()
    const onAnswered = vi.fn()
    const { user } = renderBody({}, onAnswered)

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('radio', { name: 'Yes, automatically categorize them' }))

    await waitFor(() => expect(onAnswered).toHaveBeenCalledTimes(1))

    expect(screen.getByRole('radio', { name: /Something else/ })).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('radio', { name: 'Yes, automatically categorize them' })).not.toBeInTheDocument(),
    )
  })

  it('keeps a row description visible alongside the category it was answered with', async () => {
    const { user } = renderBody(multiTransactionTask())

    await user.click(screen.getByRole('radio', { name: /Multiple different things/ }))

    const firstRow = screen.getByRole('radiogroup', { name: 'What this one was for' })
    await user.click(within(firstRow).getByRole('radio', { name: 'Business Meals' }))

    const answeredSummary = screen.getByText('COSTCO WHSE').closest('button')

    expect(answeredSummary).toHaveTextContent('COSTCO WHSE')
    expect(answeredSummary).toHaveTextContent('Business Meals')
  })
})

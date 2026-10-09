import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { TasksTakeover } from '@features/bookkeeping/TasksTakeover/TasksTakeover'

import { makeCounterpartyAskForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/counterparty'
import { makeUnifiedAskFormTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { post as postUnifiedAskFormResponse } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { server } from '@msw/node'
import { readRequestJson } from '@msw/utils/request'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const OFFICE = 'acct_0f0b5c1e-1d2a-4c3b-9a8e-111111111111'
const MEALS = 'acct_0f0b5c1e-1d2a-4c3b-9a8e-222222222222'

const counterpartyForm = (merchant: string) => makeCounterpartyAskForm(
  [{ value: OFFICE, label: 'Office Expenses' }, { value: MEALS, label: 'Business Meals' }],
  {
    pickPrompt: `What were your ${merchant} purchases for?`,
    rememberPrompt: `Should we assume your future ${merchant} purchases are {{answer.category.label}} going forward?`,
    noun: 'purchase',
  },
)

const COSTCO = makeUnifiedAskFormTask({ id: '00000000-0000-4000-8000-000000000f01', title: 'Costco purchases', form: counterpartyForm('Costco') })
const STAPLES = makeUnifiedAskFormTask({ id: '00000000-0000-4000-8000-000000000f02', title: 'Staples purchase' })
const AMAZON = makeUnifiedAskFormTask({
  id: '00000000-0000-4000-8000-000000000f03',
  title: 'Amazon purchases',
  status: BusinessTaskStatus.UserMarkedCompleted,
  form: counterpartyForm('Amazon'),
  answers: { category: { choice: OFFICE }, always_this: { choice: 'always' } },
  answerSummary: 'Office Expenses',
})
const UBER = makeUnifiedAskFormTask({ id: '00000000-0000-4000-8000-000000000f04', title: 'Uber rides' })

const TASKS = [COSTCO, STAPLES, AMAZON, UBER] as UserVisibleTask[]

const TakeoverHarness = ({ tasks, initialTaskId }: { tasks: ReadonlyArray<UserVisibleTask>, initialTaskId: string }) => {
  const [taskId, setTaskId] = useState<string | null>(initialTaskId)

  return <TasksTakeover tasks={tasks} taskId={taskId} onTaskChange={setTaskId} />
}

const renderTakeover = ({ tasks = TASKS, taskId = COSTCO.id }: { tasks?: ReadonlyArray<UserVisibleTask>, taskId?: string } = {}) => ({
  user: userEvent.setup(),
  ...render(<TakeoverHarness tasks={tasks} initialTaskId={taskId} />, { wrapper: LayerTestProvider }),
})

const spyOnSubmit = (task: UnifiedAskFormTask, response?: Promise<void>) => {
  const onRequest = vi.fn<(body: unknown) => void>()

  server.use(
    postUnifiedAskFormResponse.mock({ task, categorized: true }, {
      onRequest: async ({ request }) => {
        onRequest(await readRequestJson(request))
        await response
      },
    }),
  )

  return onRequest
}

describe('TasksTakeover', () => {
  it('shows the task position and skips to the next incomplete task, past an answered one', async () => {
    const { user } = renderTakeover({ taskId: STAPLES.id })

    expect(screen.getByText('Task 2 of 4')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(await screen.findByRole('heading', { name: 'Uber rides' })).toBeInTheDocument()
    expect(screen.getByText('Task 4 of 4')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(await screen.findByRole('heading', { name: 'Costco purchases' })).toBeInTheDocument()
  })

  it('continues on a tap and moves to the next incomplete task once the answer saves', async () => {
    const onSubmit = spyOnSubmit(COSTCO)
    const { user } = renderTakeover()

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Office Expenses' }))
    await user.click(await screen.findByRole('radio', { name: 'Yes, automatically categorize them' }))

    expect(await screen.findByRole('heading', { name: 'Staples purchase' })).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({ answers: { category: { choice: OFFICE }, always_this: { choice: 'always' } } })
  })

  it('asks for a note with Next under "Something else", keeping Skip', async () => {
    const { user } = renderTakeover()

    await user.click(screen.getByRole('radio', { name: 'Something else' }))

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip' })).toBeEnabled()
  })

  it('keeps Close and Skip disabled while an answer saves', async () => {
    let respond = () => {}
    const onSubmit = spyOnSubmit(STAPLES, new Promise<void>((resolve) => {
      respond = resolve
    }))
    const { user } = renderTakeover({ taskId: STAPLES.id })

    await user.type(screen.getByRole('textbox'), 'Printer paper')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())

    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip' })).toBeDisabled()

    respond()
    expect(await screen.findByRole('heading', { name: 'Uber rides' })).toBeInTheDocument()
  })

  it('closes once the last incomplete task is saved', async () => {
    const onSubmit = spyOnSubmit(STAPLES)
    const { user } = renderTakeover({ tasks: [STAPLES, AMAZON] as UserVisibleTask[], taskId: STAPLES.id })

    expect(screen.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument()

    await user.type(screen.getByRole('textbox'), 'Printer paper')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows an answered task with its saved answer', () => {
    renderTakeover({ taskId: AMAZON.id })

    expect(screen.getByRole('heading', { name: 'Amazon purchases' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Office Expenses' })).toBeChecked()
  })

  it('shows Submit instead of continuing on a tap when the step is not editable', () => {
    const locked = makeUnifiedAskFormTask({
      id: '00000000-0000-4000-8000-000000000f05',
      title: 'Locked answer',
      status: BusinessTaskStatus.UserMarkedCompleted,
      answers: { kind: { choice: 'supplies' } },
      form: {
        entryPageId: 'only',
        pages: [{
          id: 'only',
          next: { kind: AskFormNextKind.Submit, review: false },
          steps: [{
            id: 'kind',
            editable: false,
            type: AskFormStepType.Choice,
            prompt: 'What was it?',
            autoAdvance: true,
            options: [{ value: 'supplies', label: 'Supplies' }, { value: 'travel', label: 'Travel' }],
          }],
        }],
      },
    }) as UserVisibleTask
    renderTakeover({ tasks: [locked, UBER] as UserVisibleTask[], taskId: locked.id })

    expect(screen.getByRole('radio', { name: 'Supplies' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Travel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()
  })
})

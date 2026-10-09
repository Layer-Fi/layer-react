import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { TasksListMobile } from '@features/bookkeeping/TasksList/TasksListMobile'

import { makeUnifiedAskFormTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const STAPLES = makeUnifiedAskFormTask({
  id: '00000000-0000-4000-8000-000000000f11',
  title: 'Staples purchases',
  transactions: [
    { id: 'txn-1', date: new Date('2025-02-03T00:00:00.000Z'), amount: -12000, description: 'STAPLES' },
    { id: 'txn-2', date: new Date('2025-02-19T00:00:00.000Z'), amount: -3050, description: 'STAPLES' },
  ],
})
const UBER = makeUnifiedAskFormTask({ id: '00000000-0000-4000-8000-000000000f12', title: 'Uber rides' })
const AMAZON = makeUnifiedAskFormTask({
  id: '00000000-0000-4000-8000-000000000f13',
  title: 'Amazon purchases',
  status: BusinessTaskStatus.UserMarkedCompleted,
  answers: { response: { text: 'Office chairs' } },
  answerSummary: 'Office chairs',
})

const TASKS = [STAPLES, UBER, AMAZON] as UserVisibleTask[]

const renderList = (tasks: ReadonlyArray<UserVisibleTask> = TASKS) => ({
  user: userEvent.setup(),
  ...render(<TasksListMobile tasks={tasks} />, { wrapper: LayerTestProvider }),
})

describe('TasksListMobile', () => {
  it('lists open tasks with their transactions and answered tasks with their answer', () => {
    renderList()

    expect(within(screen.getByRole('row', { name: /Staples purchases/ })).getByText('2 transactions · $150.50')).toBeInTheDocument()
    expect(within(screen.getByRole('row', { name: /Amazon purchases/ })).getByText('Office chairs')).toBeInTheDocument()
  })

  it('opens the first incomplete task from "Answer N tasks"', async () => {
    const { user } = renderList()

    await user.click(screen.getByRole('button', { name: 'Answer 2 tasks' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Staples purchases' })).toBeInTheDocument()
  })

  it('opens an answered task from its row to show the answer', async () => {
    const { user } = renderList()

    await user.click(screen.getByRole('row', { name: /Amazon purchases/ }))

    expect(await screen.findByRole('heading', { name: 'Amazon purchases' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Office chairs')).toBeInTheDocument()
  })

  it('leaves out "Answer N tasks" once every task is answered', () => {
    renderList([AMAZON] as UserVisibleTask[])

    expect(screen.getByRole('row', { name: /Amazon purchases/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Answer/ })).not.toBeInTheDocument()
  })
})

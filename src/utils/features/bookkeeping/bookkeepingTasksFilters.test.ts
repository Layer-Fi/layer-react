import { describe, expect, it } from 'vitest'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { findNextIncompleteTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'

const TASKS = [
  { id: 'a', status: BusinessTaskStatus.Todo },
  { id: 'b', status: BusinessTaskStatus.UserMarkedCompleted },
  { id: 'c', status: BusinessTaskStatus.Todo },
  { id: 'd', status: BusinessTaskStatus.Todo },
]

describe('findNextIncompleteTask', () => {
  it.each([
    { currentId: 'a', expected: 'c' },
    { currentId: 'c', expected: 'd' },
    { currentId: 'd', expected: 'a' },
    { currentId: 'b', expected: 'c' },
  ])('after $currentId returns $expected, skipping answered tasks and wrapping round', ({ currentId, expected }) => {
    expect(findNextIncompleteTask(TASKS, currentId)?.id).toBe(expected)
  })

  it('never returns the current task', () => {
    const tasks = [{ id: 'a', status: BusinessTaskStatus.Todo }, { id: 'b', status: BusinessTaskStatus.UserMarkedCompleted }]

    expect(findNextIncompleteTask(tasks, 'a')).toBeUndefined()
  })
})

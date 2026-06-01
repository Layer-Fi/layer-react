import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, within } from '@testing-library/react'

import type { UserVisibleTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { TasksListMobile } from '@components/Tasks/TasksListMobile'

/**
 * Reproduction for the long-standing "the second task submission overwrites the
 * first" bug.
 *
 * The mobile list rendered task items with `key={index}` (NOT `key={task.id}`).
 * When the first incomplete task is answered it transitions to
 * USER_MARKED_COMPLETED and drops out of the incomplete list, so the slot at a
 * given index is now occupied by a *different* task. Because React keys the
 * element by array index, it reuses the previous component instance — including
 * its local `userResponse` state — for the new task. The user then sees (and can
 * submit) the previous task's typed response against the new task, which looks
 * like "two tasks submitted at basically the same time".
 *
 * This test types a response into the first task, then re-renders the list with
 * that task completed (so the next task shifts into index 0) and asserts the
 * textarea no longer carries the previous task's text.
 *
 *   - Buggy code (`key={index}`):   textarea retains "Response for task A"  -> FAILS
 *   - Fixed code (`key={task.id}`): textarea is reset for task B            -> PASSES
 */

// The hooks pull in SWR / auth / Layer context which are irrelevant to this
// reconciliation bug — stub them so the item renders in isolation.
vi.mock(
  '@hooks/api/businesses/[business-id]/tasks/[task-id]/user-response/useSubmitResponseForTask',
  () => ({ useSubmitUserResponseForTask: () => ({ trigger: vi.fn(), isMutating: false }) }),
)
vi.mock(
  '@hooks/api/businesses/[business-id]/tasks/[task-id]/upload/useUploadDocumentsForTask',
  () => ({ useUploadDocumentsForTask: () => ({ trigger: vi.fn(), isMutating: false }) }),
)
vi.mock(
  '@hooks/api/businesses/[business-id]/tasks/[task-id]/upload/delete/useDeleteUploadsOnTask',
  () => ({ useDeleteUploadsOnTask: () => ({ trigger: vi.fn(), isMutating: false }) }),
)
vi.mock(
  '@hooks/api/businesses/[business-id]/tasks/[task-id]/upload/update-description/useUpdateTaskUploadDescription',
  () => ({ useUpdateTaskUploadDescription: () => ({ trigger: vi.fn(), isMutating: false }) }),
)

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback ?? _key }),
}))

vi.mock('@hooks/utils/i18n/useIntlFormatter', () => ({
  useIntlFormatter: () => ({ formatNumber: (value: number) => String(value) }),
}))

function makeTask(overrides: Partial<UserVisibleTask> & { id: string }): UserVisibleTask {
  return {
    question: `Question for ${overrides.id}`,
    title: `Title for ${overrides.id}`,
    status: 'TODO',
    transaction_id: null,
    type: 'GENERIC',
    user_marked_completed_at: null,
    user_response: null,
    user_response_type: 'FREE_RESPONSE',
    archived_at: null,
    completed_at: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    effective_date: '2026-01-01',
    documents: [],
    ...overrides,
  } as UserVisibleTask
}

describe('TasksListMobile task identity', () => {
  it('does not leak a previous task\'s typed response into the next task', () => {
    const taskA = makeTask({ id: 'task-A' })
    const taskB = makeTask({ id: 'task-B' })

    const Harness = () => {
      // Start with both tasks incomplete, A first.
      const [tasks, setTasks] = useState<ReadonlyArray<UserVisibleTask>>([taskA, taskB])

      return (
        <>
          <button
            type='button'
            data-testid='complete-a'
            onClick={() =>
              // Simulate task A being answered: it becomes USER_MARKED_COMPLETED
              // and re-sorts behind the still-incomplete task B.
              setTasks([
                taskB,
                { ...taskA, status: 'USER_MARKED_COMPLETED', user_response: 'Response for task A' },
              ])}
          />
          <TasksListMobile
            tasksCount={tasks.length}
            sortedTasks={tasks}
            indexFirstIncomplete={0}
            currentPage={1}
            pageSize={8}
            setCurrentPage={() => {}}
          />
        </>
      )
    }

    const { container, getByTestId } = render(<Harness />)

    // The top "unresolved tasks" list lives in `container`; the full list is
    // portalled into document.body by MobilePanel. Scope to the top list.
    const firstTextarea = within(container).getAllByRole('textbox')[0]
    fireEvent.change(firstTextarea, { target: { value: 'Response for task A' } })
    expect((firstTextarea as HTMLTextAreaElement).value).toBe('Response for task A')

    // Task A is answered -> only task B remains incomplete and shifts to index 0.
    fireEvent.click(getByTestId('complete-a'))

    const nowFirstTextarea = within(container).getAllByRole('textbox')[0] as HTMLTextAreaElement

    // Task B has no response yet, so its textarea must be empty. With the buggy
    // index-based key, React reuses task A's instance and this still reads
    // "Response for task A".
    expect(nowFirstTextarea.value).toBe('')
  })
})

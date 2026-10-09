import { act, waitFor } from '@testing-library/react'
import { delay, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { isUnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTask'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { useGetBookkeepingPeriods } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { usePostUnifiedAskFormResponse } from '@api/businesses/[business-id]/unified-tasks/[task-id]/response/post'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { post as postUnifiedAskFormResponse } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { server } from '@msw/node'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

describe('usePostUnifiedAskFormResponse', () => {
  it('marks the task completed in the cached periods before the refetch lands', async () => {
    server.use(getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })))

    const { result } = await renderHookWithAuth(() => ({
      periods: useGetBookkeepingPeriods(),
      submit: usePostUnifiedAskFormResponse(),
    }))

    await waitFor(() => expect(result.current.periods.data).toBeDefined())

    const findTask = (taskId: string) =>
      (result.current.periods.data ?? []).flatMap(period => period.tasks).find(task => task.id === taskId)

    const task = (result.current.periods.data ?? [])
      .flatMap(period => period.tasks)
      .find(candidate => isUnifiedAskFormTask(candidate) && candidate.status === BusinessTaskStatus.Todo)

    if (!task || !isUnifiedAskFormTask(task)) throw new Error('Expected a to-do unified task in the seeded periods')

    server.use(
      postUnifiedAskFormResponse.mock({ task: { ...task, status: BusinessTaskStatus.UserMarkedCompleted }, categorized: false }),
      http.get('*/v1/businesses/:businessId/bookkeeping/periods-with-unified-tasks', async () => {
        await delay('infinite')
      }),
    )

    await act(async () => {
      await result.current.submit.trigger({ taskId: task.id, answers: { response: { text: 'Office supplies' } } })
    })

    await waitFor(() => expect(findTask(task.id)?.status).toBe(BusinessTaskStatus.UserMarkedCompleted))
  })
})

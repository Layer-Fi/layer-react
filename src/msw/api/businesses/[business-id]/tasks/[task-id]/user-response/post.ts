import { Schema } from 'effect'

import { BookkeepingPeriodStatus } from '@schemas/bookkeepingPeriods'
import {
  type BusinessTask,
  BusinessTaskSchema,
  BusinessTaskStatus,
  TaskUserResponseType,
} from '@schemas/businessTasks/businessTask'

import { bookkeepingPeriodStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeTask = Schema.encodeSync(BusinessTaskSchema)

const toResponse = (task: BusinessTask) => apiData(encodeTask(task))

const completeTaskInStore = (taskId: string, userResponse: string | null): BusinessTask | undefined => {
  let completed: BusinessTask | undefined

  bookkeepingPeriodStore.all().forEach((period) => {
    if (!period.tasks.some(task => task.id === taskId)) return

    bookkeepingPeriodStore.patchById(period.id, (existing) => {
      const tasks = existing.tasks.map((task) => {
        if (task.id !== taskId) return task

        completed = { ...task, status: BusinessTaskStatus.UserMarkedCompleted, userResponse }
        return completed
      })

      const allTasksComplete = tasks.every(task => task.status !== BusinessTaskStatus.Todo)

      return {
        ...existing,
        tasks,
        status: allTasksComplete ? BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER : existing.status,
      }
    })
  })

  return completed
}

export const post = createMockEndpoint<BusinessTask, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/tasks/:taskId/user-response',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const body = await readRequestJson(request) as { user_response?: string }
    const taskId = String(params.taskId)
    const userResponse = body.user_response ?? null

    const completed = completeTaskInStore(taskId, userResponse) ?? {
      id: taskId,
      status: BusinessTaskStatus.UserMarkedCompleted,
      title: '',
      question: '',
      userResponse,
      userResponseType: TaskUserResponseType.FreeResponse,
      documents: null,
    }

    return toResponse(completed)
  },
})

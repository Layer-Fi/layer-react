import { Schema } from 'effect'

import {
  type BusinessTask,
  BusinessTaskSchema,
  BusinessTaskStatus,
} from '@schemas/businessTasks/businessTask'

import { completeTaskInStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { makeFallbackTask } from '@msw/api/businesses/[business-id]/tasks/makeFallbackTask'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeTask = Schema.encodeSync(BusinessTaskSchema)

const toResponse = (task: BusinessTask) => apiData(encodeTask(task))

export const post = createMockEndpoint<BusinessTask, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/tasks/:taskId/user-response',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const body = await readRequestJson(request) as { user_response?: string }
    const taskId = String(params.taskId)
    const userResponse = body.user_response ?? null

    const completed = completeTaskInStore(taskId, userResponse)
      ?? makeFallbackTask(taskId, { status: BusinessTaskStatus.UserMarkedCompleted, userResponse })

    return toResponse(completed)
  },
})

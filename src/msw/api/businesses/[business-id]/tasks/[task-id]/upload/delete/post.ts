import { Schema } from 'effect'

import {
  type BusinessTask,
  BusinessTaskSchema,
  BusinessTaskStatus,
} from '@schemas/businessTasks/businessTask'

import { patchTaskInStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { makeFallbackTask } from '@msw/api/businesses/[business-id]/tasks/makeFallbackTask'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeTask = Schema.encodeSync(BusinessTaskSchema)

const toResponse = (task: BusinessTask) => apiData(encodeTask(task))

export const post = createMockEndpoint<BusinessTask, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/tasks/:taskId/upload/delete',
  resolve: ({ override, params }) => {
    if (override) return toResponse(override)

    const taskId = String(params.taskId)

    const cleared = patchTaskInStore(taskId, task => ({
      ...task,
      status: BusinessTaskStatus.Todo,
      userResponse: null,
      documents: null,
    })) ?? makeFallbackTask(taskId)

    return toResponse(cleared)
  },
})

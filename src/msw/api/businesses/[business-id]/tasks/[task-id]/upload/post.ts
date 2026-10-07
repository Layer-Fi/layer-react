import { Schema } from 'effect'

import { type BusinessTask, BusinessTaskSchema } from '@schemas/features/bookkeeping/businessTask'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

import { makeFallbackTask } from '@msw/api/businesses/[business-id]/tasks/makeFallbackTask'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeTask = Schema.encodeSync(BusinessTaskSchema)

const toResponse = (task: BusinessTask) => apiData(encodeTask(task))

const toTaskDocument = (file: File) => ({
  fileName: file.name,
  presignedUrl: {
    presignedUrl: `https://example.com/uploads/${encodeURIComponent(file.name)}`,
    fileType: file.type || 'application/octet-stream',
    fileName: file.name,
    createdAt: new Date(),
    documentId: crypto.randomUUID(),
  },
})

export const post = createMockEndpoint<BusinessTask, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/tasks/:taskId/upload',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const formData = await request.formData()
    const files = formData.getAll('file').filter((entry): entry is File => entry instanceof File)
    const description = formData.get('description')

    return toResponse(makeFallbackTask(String(params.taskId), {
      status: BusinessTaskStatus.UserMarkedCompleted,
      userResponse: typeof description === 'string' ? description : null,
      documents: files.map(toTaskDocument),
    }))
  },
})

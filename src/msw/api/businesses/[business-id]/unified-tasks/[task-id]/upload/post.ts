import { Schema } from 'effect'

import { type AskFormUploadResult, AskFormUploadResultSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormUpload'

import { unifiedTaskDocumentStore } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/upload/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { assertRequest, readRequestFiles } from '@msw/utils/request'

const MAX_FILES_PER_UPLOAD = 10

const encodeResult = Schema.encodeSync(AskFormUploadResultSchema)

const toResponse = (result: AskFormUploadResult) => apiData(encodeResult(result))

export const post = createMockEndpoint<AskFormUploadResult, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/upload',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const files = await readRequestFiles(request)
    assertRequest(files.length <= MAX_FILES_PER_UPLOAD, `Too many files uploaded. Only ${MAX_FILES_PER_UPLOAD} allowed`)

    const taskId = String(params.taskId)
    const documents = files.map(file => ({ id: crypto.randomUUID(), fileName: file.name }))
    const uploadedIds = unifiedTaskDocumentStore.findById(taskId)?.documentIds ?? []
    unifiedTaskDocumentStore.save({ id: taskId, documentIds: [...uploadedIds, ...documents.map(({ id }) => id)] })

    return toResponse({ documents })
  },
})

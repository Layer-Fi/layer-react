import { Schema } from 'effect'

import { type AskFormUploadResult, AskFormUploadResultSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormUpload'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeResult = Schema.encodeSync(AskFormUploadResultSchema)

const toResponse = (result: AskFormUploadResult) => apiData(encodeResult(result))

export const post = createMockEndpoint<AskFormUploadResult, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/upload',
  resolve: async ({ override, request }) => {
    if (override) return toResponse(override)

    const formData = await request.formData()
    const files = formData.getAll('file').filter((entry): entry is File => entry instanceof File)

    return toResponse({ documents: files.map(file => ({ id: crypto.randomUUID(), fileName: file.name })) })
  },
})

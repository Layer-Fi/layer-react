import { Schema } from 'effect'
import { HttpResponse } from 'msw'

import { UnifiedAskFormSubmissionSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmission'
import {
  type UnifiedAskFormSubmissionResult,
  UnifiedAskFormSubmissionResultSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'

import {
  findUnifiedAskFormTaskInStore,
  patchUnifiedAskFormTaskInStore,
} from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/store'
import { apiData, apiError } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { decodeRequestBody, readRequestJson } from '@msw/utils/request'

const encodeResult = Schema.encodeSync(UnifiedAskFormSubmissionResultSchema)

const toResponse = (result: UnifiedAskFormSubmissionResult) => apiData(encodeResult(result))

export const put = createMockEndpoint<UnifiedAskFormSubmissionResult, ReturnType<typeof toResponse>>({
  method: 'put',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/draft',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const { answers } = decodeRequestBody(UnifiedAskFormSubmissionSchema, await readRequestJson(request))
    const taskId = String(params.taskId)
    const existing = findUnifiedAskFormTaskInStore(taskId)

    if (!existing) {
      // MSW sends a thrown Response as the mocked response.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw HttpResponse.json(apiError(`No task found with ID ${taskId}`, { type: 'ResourceNotFound', errorEnum: 'SpecifiedIdNotFound' }), { status: 404 })
    }

    const task = patchUnifiedAskFormTaskInStore(taskId, task => ({ ...task, answers })) ?? existing

    return toResponse({ task, categorized: false })
  },
})

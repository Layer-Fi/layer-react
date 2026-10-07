import { Schema } from 'effect'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { UnifiedAskFormSubmissionSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmission'
import {
  type UnifiedAskFormSubmissionResult,
  UnifiedAskFormSubmissionResultSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'

import { makeUnifiedAskFormTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { patchUnifiedAskFormTaskInStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/store'
import { decodeAskFormRequest } from '@msw/api/businesses/[business-id]/tasks/askFormValidation'
import { isCategorizedByAskFormAnswers, summarizeAskFormAnswers } from '@msw/api/businesses/[business-id]/unified-tasks/askFormAnswers'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeResult = Schema.encodeSync(UnifiedAskFormSubmissionResultSchema)

const toResponse = (result: UnifiedAskFormSubmissionResult) => apiData(encodeResult(result))

export const post = createMockEndpoint<UnifiedAskFormSubmissionResult, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/response',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const { answers } = decodeAskFormRequest(UnifiedAskFormSubmissionSchema, await readRequestJson(request))
    const taskId = String(params.taskId)
    const task = patchUnifiedAskFormTaskInStore(taskId, task => ({
      ...task,
      status: BusinessTaskStatus.UserMarkedCompleted,
      answers,
      answerSummary: summarizeAskFormAnswers(task.form, answers),
    })) ?? makeUnifiedAskFormTask({ id: taskId, status: BusinessTaskStatus.UserMarkedCompleted, answers })

    return toResponse({ task, categorized: isCategorizedByAskFormAnswers(answers) })
  },
})

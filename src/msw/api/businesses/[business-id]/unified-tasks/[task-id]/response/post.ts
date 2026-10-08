import { Schema } from 'effect'
import { HttpResponse } from 'msw'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type AskFormAnswers } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { UnifiedAskFormSubmissionSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmission'
import {
  type UnifiedAskFormSubmissionResult,
  UnifiedAskFormSubmissionResultSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'

import {
  findUnifiedAskFormTaskInStore,
  patchUnifiedAskFormTaskInStore,
} from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/store'
import { unifiedTaskDocumentStore } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/upload/store'
import { isCategorizedByAskFormAnswers, summarizeAskFormAnswers } from '@msw/api/businesses/[business-id]/unified-tasks/askFormAnswers'
import { assertAskFormRequest, decodeAskFormRequest } from '@msw/api/businesses/[business-id]/unified-tasks/askFormValidation'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeResult = Schema.encodeSync(UnifiedAskFormSubmissionResultSchema)

const toResponse = (result: UnifiedAskFormSubmissionResult) => apiData(encodeResult(result))

const notFound = (description: string) =>
  HttpResponse.json({ errors: [{ type: 'ResourceNotFound', description, error_enum: 'SpecifiedIdNotFound' }] }, { status: 404 })

const collectDocumentIds = (answers: AskFormAnswers) =>
  Object.values(answers).flatMap(answer => 'documentIds' in answer ? answer.documentIds : [])

export const post = createMockEndpoint<UnifiedAskFormSubmissionResult, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/response',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const { answers } = decodeAskFormRequest(UnifiedAskFormSubmissionSchema, await readRequestJson(request))
    const taskId = String(params.taskId)
    const existing = findUnifiedAskFormTaskInStore(taskId)

    // MSW sends a thrown Response as the mocked response.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    if (!existing) throw notFound(`No task found with ID ${taskId}`)

    const knownDocumentIds = new Set([
      ...(unifiedTaskDocumentStore.findById(taskId)?.documentIds ?? []),
      ...collectDocumentIds(existing.answers ?? {}),
    ])
    const submittedDocumentIds = collectDocumentIds(answers)
    const unknownDocumentIds = submittedDocumentIds.filter(id => !knownDocumentIds.has(id))
    assertAskFormRequest(unknownDocumentIds.length === 0, `Documents ${unknownDocumentIds.join(',')} are not uploaded to task ${taskId}`)

    const task = patchUnifiedAskFormTaskInStore(taskId, task => ({
      ...task,
      status: BusinessTaskStatus.UserMarkedCompleted,
      answers,
      answerSummary: summarizeAskFormAnswers(task.form, answers),
    })) ?? existing

    if (submittedDocumentIds.length > 0) unifiedTaskDocumentStore.save({ id: taskId, documentIds: submittedDocumentIds })

    return toResponse({ task, categorized: isCategorizedByAskFormAnswers(answers) })
  },
})

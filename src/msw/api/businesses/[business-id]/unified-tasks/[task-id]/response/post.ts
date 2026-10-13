import { Schema } from 'effect'
import { HttpResponse } from 'msw'

import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type AskFormAnswer, type AskFormAnswers, isDocumentsAnswer } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { type AskFormStep, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { type AskFormDocument } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormUpload'
import { UnifiedAskFormSubmissionSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmission'
import {
  type UnifiedAskFormSubmissionResult,
  UnifiedAskFormSubmissionResultSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'

import {
  findUnifiedAskFormTaskInStore,
  patchUnifiedAskFormTaskInStore,
} from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/store'
import { findUnifiedTaskDocuments, saveUnifiedTaskDocuments } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/upload/store'
import { isCategorizedByAskFormAnswers, summarizeAskFormAnswers } from '@msw/api/businesses/[business-id]/unified-tasks/askFormAnswers'
import { apiData, apiError } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { assertRequest, decodeRequestBody, readRequestJson } from '@msw/utils/request'

const encodeResult = Schema.encodeSync(UnifiedAskFormSubmissionResultSchema)

const toResponse = (result: UnifiedAskFormSubmissionResult) => apiData(encodeResult(result))

const notFound = (description: string) =>
  HttpResponse.json(apiError(description, { type: 'ResourceNotFound', errorEnum: 'SpecifiedIdNotFound' }), { status: 404 })

const toDocumentIds = (answer: AskFormAnswer | undefined) => (isDocumentsAnswer(answer) ? answer.documentIds : [])

const collectDocumentIds = (answers: AskFormAnswers) => Object.values(answers).flatMap(toDocumentIds)

/** Lists each UPLOAD step's answered documents on the step, as the API does once a task is answered. */
const withStepDocuments = (steps: ReadonlyArray<AskFormStep>, answers: AskFormAnswers, documents: ReadonlyArray<AskFormDocument>) =>
  steps.map((step) => {
    if (step.type !== AskFormStepType.Upload) return step

    const documentIds = new Set(toDocumentIds(answers[step.id]))
    return { ...step, documents: documents.filter(({ id }) => documentIds.has(id)) }
  })

export const post = createMockEndpoint<UnifiedAskFormSubmissionResult, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/response',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const { answers } = decodeRequestBody(UnifiedAskFormSubmissionSchema, await readRequestJson(request))
    const taskId = String(params.taskId)
    const existing = findUnifiedAskFormTaskInStore(taskId)

    // MSW sends a thrown Response as the mocked response.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    if (!existing) throw notFound(`No task found with ID ${taskId}`)

    const storedDocuments = findUnifiedTaskDocuments(taskId)
    const knownDocumentIds = new Set([...storedDocuments.map(({ id }) => id), ...collectDocumentIds(existing.answers ?? {})])
    const submittedDocumentIds = collectDocumentIds(answers)
    const unknownDocumentIds = submittedDocumentIds.filter(id => !knownDocumentIds.has(id))
    assertRequest(unknownDocumentIds.length === 0, `Documents ${unknownDocumentIds.join(',')} are not uploaded to task ${taskId}`)

    const task = patchUnifiedAskFormTaskInStore(taskId, task => ({
      ...task,
      status: BusinessTaskStatus.UserMarkedCompleted,
      form: { ...task.form, pages: task.form.pages.map(page => ({ ...page, steps: withStepDocuments(page.steps, answers, storedDocuments) })) },
      answers,
      answerSummary: summarizeAskFormAnswers(task.form, answers),
    })) ?? existing

    if (submittedDocumentIds.length > 0) saveUnifiedTaskDocuments(taskId, storedDocuments.filter(({ id }) => submittedDocumentIds.includes(id)))

    return toResponse({ task, categorized: isCategorizedByAskFormAnswers(task.form, answers) })
  },
})

import { Schema } from 'effect'

import { makeAccountId } from '@schemas/common/accountIdentifier'
import { isCounterpartyAskTask, isLegacyBusinessTask, isUnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTask'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type CounterpartyAskAccount, type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type AskFormAnswers } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { UnifiedAskFormSubmissionSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmission'
import {
  type UnifiedAskFormSubmissionResult,
  UnifiedAskFormSubmissionResultSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'

import {
  ASK_FORM_STEP_IDS,
  COUNTERPARTY_ASK_FORM_VALUES,
  findCategoryOptionValue,
  makeUnifiedAskFormTask,
} from '@fixtures/bookkeeping/unifiedAskFormTasks'
import {
  findTaskInStore,
  patchTaskInStore,
  patchUnifiedAskFormTaskInStore,
  syncCounterpartyAskSiblings,
} from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { decodeAskFormRequest } from '@msw/api/businesses/[business-id]/tasks/askFormValidation'
import {
  isCategorizedByAskFormAnswers,
  summarizeAskFormAnswers,
  toUnifiedAskFormTask,
  unifiedAskFormAnswerStore,
} from '@msw/api/businesses/[business-id]/tasks/unifiedAskFormTasks'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeResult = Schema.encodeSync(UnifiedAskFormSubmissionResultSchema)

const toResponse = (result: UnifiedAskFormSubmissionResult) => apiData(encodeResult(result))

const getResponseText = (answers: AskFormAnswers) => {
  const response = answers[ASK_FORM_STEP_IDS.response]
  return response && 'text' in response ? response.text : null
}

const ACCOUNT_OPTION_PREFIX = 'acct_'

const getChoice = (answers: AskFormAnswers, stepId: string) => {
  const answer = answers[stepId]
  return answer && 'choice' in answer ? answer.choice : null
}

const toResponseAccount = (task: CounterpartyAskTask, choice: string | null): CounterpartyAskAccount | null => {
  if (!choice?.startsWith(ACCOUNT_OPTION_PREFIX)) return null

  return task.suggestions.find(({ accountIdentifier }) => findCategoryOptionValue(accountIdentifier) === choice)
    ?? { accountIdentifier: makeAccountId(choice.slice(ACCOUNT_OPTION_PREFIX.length)), name: '' }
}

const applyCounterpartyAnswers = (task: CounterpartyAskTask, answers: AskFormAnswers): CounterpartyAskTask => {
  const responseAccount = toResponseAccount(task, getChoice(answers, ASK_FORM_STEP_IDS.category))

  return {
    ...task,
    status: BusinessTaskStatus.UserMarkedCompleted,
    responseAccount,
    alwaysThis: responseAccount !== null && getChoice(answers, ASK_FORM_STEP_IDS.alwaysThis) === COUNTERPARTY_ASK_FORM_VALUES.always,
  }
}

const applyAnswers = (taskId: string, answers: AskFormAnswers) => {
  const stored = findTaskInStore(taskId)

  if (stored && isUnifiedAskFormTask(stored)) {
    return patchUnifiedAskFormTaskInStore(taskId, task => ({
      ...task,
      status: BusinessTaskStatus.UserMarkedCompleted,
      answers,
      answerSummary: summarizeAskFormAnswers(task.form, answers),
    }))
  }

  unifiedAskFormAnswerStore.save({ id: taskId, answers })

  const patched = patchTaskInStore(taskId, (task) => {
    if (isCounterpartyAskTask(task)) return applyCounterpartyAnswers(task, answers)

    return {
      ...task,
      status: BusinessTaskStatus.UserMarkedCompleted,
      ...(isLegacyBusinessTask(task) ? { userResponse: getResponseText(answers) ?? task.userResponse } : {}),
    }
  })

  if (patched && isCounterpartyAskTask(patched)) syncCounterpartyAskSiblings(patched)

  const unified = patched ? toUnifiedAskFormTask(patched) : undefined

  return unified && isUnifiedAskFormTask(unified) ? unified : undefined
}

export const post = createMockEndpoint<UnifiedAskFormSubmissionResult, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/response',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const { answers } = decodeAskFormRequest(UnifiedAskFormSubmissionSchema, await readRequestJson(request))
    const taskId = String(params.taskId)
    const task = applyAnswers(taskId, answers)
      ?? makeUnifiedAskFormTask({ id: taskId, status: BusinessTaskStatus.UserMarkedCompleted, answers })

    return toResponse({ task, categorized: isCategorizedByAskFormAnswers(answers) })
  },
})

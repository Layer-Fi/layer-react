import { Schema } from 'effect'

import { AccountIdentifierEquivalence } from '@schemas/common/accountIdentifier'
import { isCounterpartyAskTask } from '@schemas/features/bookkeeping/businessTask'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { CounterpartyAskResponseSchema } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskResponse'
import {
  type CounterpartyAskAccount,
  type CounterpartyAskTask,
  CounterpartyAskTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'

import { patchTaskInStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { makeFallbackCounterpartyAskTask } from '@msw/api/businesses/[business-id]/tasks/makeFallbackCounterpartyAskTask'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeTask = Schema.encodeSync(CounterpartyAskTaskSchema)
const decodeResponse = Schema.decodeUnknownSync(CounterpartyAskResponseSchema)

const toResponse = (task: CounterpartyAskTask) => apiData(encodeTask(task))

const resolveAnsweredAccount = (
  task: CounterpartyAskTask,
  accountIdentifier: CounterpartyAskAccount['accountIdentifier'],
): CounterpartyAskAccount =>
  task.suggestions.find(suggestion =>
    AccountIdentifierEquivalence(suggestion.accountIdentifier, accountIdentifier),
  ) ?? { accountIdentifier, name: '' }

const applyResponse = (
  task: CounterpartyAskTask,
  response: ReturnType<typeof decodeResponse>,
): CounterpartyAskTask => {
  const answered = { ...task, status: BusinessTaskStatus.UserMarkedCompleted }

  if ('transactionResponses' in response) {
    return {
      ...answered,
      transactionResponses: response.transactionResponses.map(transactionResponse => ({
        transactionId: transactionResponse.transactionId,
        userResponse: 'userResponse' in transactionResponse ? transactionResponse.userResponse : null,
        responseAccount: 'accountIdentifier' in transactionResponse
          ? resolveAnsweredAccount(task, transactionResponse.accountIdentifier)
          : null,
      })),
    }
  }

  return {
    ...answered,
    alwaysThis: response.alwaysThis,
    userResponse: 'userResponse' in response ? response.userResponse : null,
    responseAccount: 'accountIdentifier' in response
      ? resolveAnsweredAccount(task, response.accountIdentifier)
      : null,
  }
}

export const post = createMockEndpoint<CounterpartyAskTask, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/tasks/:taskId/counterparty-ask-response',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const response = decodeResponse(await readRequestJson(request))
    const taskId = String(params.taskId)

    let answered: CounterpartyAskTask | undefined

    patchTaskInStore(taskId, (task) => {
      if (!isCounterpartyAskTask(task)) return task

      answered = applyResponse(task, response)
      return answered
    })

    return toResponse(answered ?? applyResponse(makeFallbackCounterpartyAskTask(taskId), response))
  },
})

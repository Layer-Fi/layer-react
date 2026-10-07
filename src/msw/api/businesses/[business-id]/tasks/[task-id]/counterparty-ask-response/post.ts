import { Schema } from 'effect'

import { AccountIdentifierEquivalence } from '@schemas/common/accountIdentifier'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { CounterpartyAskResponseSchema } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskResponse'
import {
  type CounterpartyAskAccount,
  type CounterpartyAskTask,
  CounterpartyAskTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'

import {
  patchCounterpartyAskTaskInStore,
  syncCounterpartyAskSiblings,
} from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
import { makeFallbackCounterpartyAskTask } from '@msw/api/businesses/[business-id]/tasks/makeFallbackCounterpartyAskTask'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeTask = Schema.encodeSync(CounterpartyAskTaskSchema)
// The API 400s on mixed arms (an account and free text, or `always_this` with
// `transaction_responses`); the union alone ignores the extra key, so reject it here.
const decodeResponse = Schema.decodeUnknownSync(
  CounterpartyAskResponseSchema,
  { onExcessProperty: 'error' },
)

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
      alwaysThis: false,
      userResponse: null,
      responseAccount: null,
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
    transactionResponses: task.transactionResponses.map(({ transactionId }) => ({
      transactionId,
      userResponse: null,
      responseAccount: null,
    })),
  }
}

export const post = createMockEndpoint<CounterpartyAskTask, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/tasks/:taskId/counterparty-ask-response',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const response = decodeResponse(await readRequestJson(request))
    const taskId = String(params.taskId)

    const answered = patchCounterpartyAskTaskInStore(taskId, task => applyResponse(task, response))

    if (answered) syncCounterpartyAskSiblings(answered)

    return toResponse(answered ?? applyResponse(makeFallbackCounterpartyAskTask(taskId), response))
  },
})

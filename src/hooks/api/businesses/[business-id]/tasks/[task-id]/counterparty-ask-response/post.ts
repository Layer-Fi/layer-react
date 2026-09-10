import { Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import {
  type CounterpartyAskResponse,
  type CounterpartyAskResponseEncoded,
  CounterpartyAskResponseSchema,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskResponse'
import { CounterpartyAskTaskSchema } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBankTransactionTriggerSuccess } from '@api/businesses/[business-id]/bank-transactions/triggerSuccess'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods/get'
import { useCategorizationRulesGlobalCacheActions } from '@api/businesses/[business-id]/categorization-rules/get'

const COUNTERPARTY_ASK_RESPONSE_TAG_KEY = '#counterparty-ask-response'

const PostCounterpartyAskResponseReturnSchema = UnwrappedDataResponseSchema(CounterpartyAskTaskSchema)

const encodeCounterpartyAskResponse = Schema.encodeSync(CounterpartyAskResponseSchema)

const postCounterpartyAskResponse = post<
  typeof PostCounterpartyAskResponseReturnSchema.Encoded,
  CounterpartyAskResponseEncoded,
  { businessId: string, taskId: string }
>(
  ({ businessId, taskId }) => `/v1/businesses/${businessId}/tasks/${taskId}/counterparty-ask-response`,
)

type UsePostCounterpartyAskResponseArg = {
  taskId: string
  response: CounterpartyAskResponse
}

export const usePostCounterpartyAskResponse = createMutationHook({
  tags: [COUNTERPARTY_ASK_RESPONSE_TAG_KEY],
  request: postCounterpartyAskResponse,
  schema: PostCounterpartyAskResponseReturnSchema,
  argToParams: ({ taskId }: UsePostCounterpartyAskResponseArg) => ({ taskId }),
  argToBody: ({ response }: UsePostCounterpartyAskResponseArg) =>
    encodeCounterpartyAskResponse(response),
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()
    const { forceReload: forceReloadCategorizationRules } = useCategorizationRulesGlobalCacheActions()
    const onBankTransactionChange = useBankTransactionTriggerSuccess()

    return (task) => {
      void invalidateBookkeepingPeriods()

      onBankTransactionChange()

      if (task.alwaysThis && task.responseAccount) {
        void forceReloadCategorizationRules()
      }
    }
  },
})

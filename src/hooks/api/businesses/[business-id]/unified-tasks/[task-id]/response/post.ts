import { Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type AskFormAnswers } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import {
  type UnifiedAskFormSubmissionEncoded,
  UnifiedAskFormSubmissionSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmission'
import {
  type UnifiedAskFormSubmissionResult,
  UnifiedAskFormSubmissionResultSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'
import { UNIFIED_ASK_FORM_VERSION } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBankTransactionTriggerSuccess } from '@api/businesses/[business-id]/bank-transactions/triggerSuccess'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { useCategorizationRulesGlobalCacheActions } from '@api/businesses/[business-id]/categorization-rules/get'

const UNIFIED_ASK_FORM_RESPONSE_TAG_KEY = '#unified-ask-form-response'

const PostUnifiedAskFormResponseReturnSchema = UnwrappedDataResponseSchema(UnifiedAskFormSubmissionResultSchema)

const encodeSubmission = Schema.encodeSync(UnifiedAskFormSubmissionSchema)

const postUnifiedAskFormResponse = post<
  typeof PostUnifiedAskFormResponseReturnSchema.Encoded,
  UnifiedAskFormSubmissionEncoded,
  { businessId: string, taskId: string }
>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/unified-tasks/${taskId}/response?form_version=${UNIFIED_ASK_FORM_VERSION}`,
)

type UsePostUnifiedAskFormResponseArg = {
  taskId: string
  answers: AskFormAnswers
}

export const usePostUnifiedAskFormResponse = createMutationHook({
  tags: [UNIFIED_ASK_FORM_RESPONSE_TAG_KEY],
  request: postUnifiedAskFormResponse,
  schema: PostUnifiedAskFormResponseReturnSchema,
  argToParams: ({ taskId }: UsePostUnifiedAskFormResponseArg) => ({ taskId }),
  argToBody: ({ answers }: UsePostUnifiedAskFormResponseArg) => encodeSubmission({ answers }),
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchTask, invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()
    const { forceReload: forceReloadCategorizationRules } = useCategorizationRulesGlobalCacheActions()
    const onBankTransactionChange = useBankTransactionTriggerSuccess()

    return async ({ task }: UnifiedAskFormSubmissionResult) => {
      await patchTask(task)
      void invalidateBookkeepingPeriods()
      onBankTransactionChange()
      void forceReloadCategorizationRules()
    }
  },
})

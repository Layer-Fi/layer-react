import { Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
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
import { put } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { replaceTaskInPeriods, useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

const UNIFIED_ASK_FORM_DRAFT_TAG_KEY = '#unified-ask-form-draft'

const PutUnifiedAskFormDraftReturnSchema = UnwrappedDataResponseSchema(UnifiedAskFormSubmissionResultSchema)

const encodeDraft = Schema.encodeSync(UnifiedAskFormSubmissionSchema)

const putUnifiedAskFormDraft = put<
  typeof PutUnifiedAskFormDraftReturnSchema.Encoded,
  UnifiedAskFormSubmissionEncoded,
  { businessId: string, taskId: string }
>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/unified-tasks/${taskId}/draft?form_version=${UNIFIED_ASK_FORM_VERSION}`,
)

type UsePutUnifiedAskFormDraftArg = {
  taskId: string
  answers: AskFormAnswers
}

export const usePutUnifiedAskFormDraft = createMutationHook({
  tags: [UNIFIED_ASK_FORM_DRAFT_TAG_KEY],
  request: putUnifiedAskFormDraft,
  schema: PutUnifiedAskFormDraftReturnSchema,
  argToParams: ({ taskId }: UsePutUnifiedAskFormDraftArg) => ({ taskId }),
  argToBody: ({ answers }: UsePutUnifiedAskFormDraftArg) => encodeDraft({ answers }),
  useOnTriggerSuccess: () => {
    const { patchCache: patchBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

    // A draft that resolves after Submit must not reopen the submitted task.
    return async ({ task }: UnifiedAskFormSubmissionResult) => {
      await patchBookkeepingPeriods(periods =>
        periods?.some(({ tasks }) => tasks.some(({ id, status }) => id === task.id && status === BusinessTaskStatus.Todo))
          ? replaceTaskInPeriods(task)(periods)
          : periods,
      )
    }
  },
})

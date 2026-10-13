import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/shared/api/apiError'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

/** Returns whether the error means the task was answered elsewhere; if so, tells the user and refetches the periods. */
export const useTaskAlreadyAnswered = () => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

  return useCallback((error: unknown) => {
    if (!isAPIErrorOfType(error, ApiEnumErrorType.BusinessTaskAlreadyCompleted)) return false

    addToast({
      content: t('bookkeeping:UnifiedAskForm.useTaskAlreadyAnswered.error.already_answered', 'This task has already been answered.'),
      type: 'error',
    })
    void invalidateBookkeepingPeriods()
    return true
  }, [addToast, t, invalidateBookkeepingPeriods])
}

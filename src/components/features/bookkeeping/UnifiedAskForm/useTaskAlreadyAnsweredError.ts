import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/shared/api/apiError'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

export const useTaskAlreadyAnsweredError = () => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

  /** Tells the user and refetches the periods when the task was answered elsewhere; returns whether the error was that case. */
  const handleTaskAlreadyAnsweredError = useCallback((error: unknown) => {
    if (!isAPIErrorOfType(error, ApiEnumErrorType.BusinessTaskAlreadyCompleted)) return false

    addToast({
      content: t('bookkeeping:UnifiedAskForm.useTaskAlreadyAnsweredError.error.already_answered', 'This task has already been answered.'),
      type: 'error',
    })
    void invalidateBookkeepingPeriods()
    return true
  }, [addToast, t, invalidateBookkeepingPeriods])

  return useMemo(() => ({ handleTaskAlreadyAnsweredError }), [handleTaskAlreadyAnsweredError])
}

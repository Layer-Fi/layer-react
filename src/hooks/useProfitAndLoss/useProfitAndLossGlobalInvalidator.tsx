import { useCallback, useMemo } from 'react'
import { useProfitAndLossReportCacheActions } from './useProfitAndLossReport'
import { useProfitAndLossSummariesCacheActions } from './useProfitAndLossSummaries'
import { debounce } from 'lodash'

const INVALIDATE_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export const useProfitAndLossGlobalInvalidator = () => {
  const { invalidateProfitAndLossReport } = useProfitAndLossReportCacheActions()
  const { invalidateProfitAndLossSummaries } = useProfitAndLossSummariesCacheActions()

  const invalidateProfitAndLoss = useCallback(async () => {
    await invalidateProfitAndLossReport()
    await invalidateProfitAndLossSummaries()
  }, [invalidateProfitAndLossReport, invalidateProfitAndLossSummaries])

  const debouncedInvalidateProfitAndLoss = useMemo(
    () => debounce(
      invalidateProfitAndLossReport,
      INVALIDATE_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATE_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateProfitAndLossReport],
  )

  return { invalidateProfitAndLoss, debouncedInvalidateProfitAndLoss }
}

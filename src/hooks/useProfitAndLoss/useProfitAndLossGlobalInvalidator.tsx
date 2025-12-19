import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash-es'

import { usePnlDetailLinesInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useProfitAndLossReportCacheActions } from '@hooks/useProfitAndLoss/useProfitAndLossReport'
import { useProfitAndLossSummariesCacheActions } from '@hooks/useProfitAndLoss/useProfitAndLossSummaries'
import { useProfitAndLossComparisonReportCacheActions } from '@hooks/useProfitAndLossComparison/useProfitAndLossComparisonReport'

const INVALIDATE_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export const useProfitAndLossGlobalInvalidator = () => {
  const { invalidateProfitAndLossReport } = useProfitAndLossReportCacheActions()
  const { invalidateProfitAndLossComparisonReport } = useProfitAndLossComparisonReportCacheActions()
  const { invalidateProfitAndLossSummaries } = useProfitAndLossSummariesCacheActions()
  const { invalidatePnlDetailLines } = usePnlDetailLinesInvalidator()

  const invalidateProfitAndLoss = useCallback(async () => {
    await invalidateProfitAndLossReport()
    await invalidateProfitAndLossComparisonReport()
    await invalidateProfitAndLossSummaries()
    await invalidatePnlDetailLines()
  }, [
    invalidateProfitAndLossReport,
    invalidateProfitAndLossComparisonReport,
    invalidateProfitAndLossSummaries,
    invalidatePnlDetailLines,
  ],
  )

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

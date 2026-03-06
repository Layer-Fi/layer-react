import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash-es'

import { usePnlDetailLinesInvalidator } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss/lines/useProfitAndLossDetailLines'
import { useProfitAndLossReportCacheActions } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss/useProfitAndLossReport'
import { useProfitAndLossComparisonReportCacheActions } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss-comparison/useProfitAndLossComparisonReport'
import { useProfitAndLossSummariesCacheActions } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss-summaries/useProfitAndLossSummaries'

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
      invalidateProfitAndLoss,
      INVALIDATE_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATE_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateProfitAndLoss],
  )

  return { invalidateProfitAndLoss, debouncedInvalidateProfitAndLoss }
}

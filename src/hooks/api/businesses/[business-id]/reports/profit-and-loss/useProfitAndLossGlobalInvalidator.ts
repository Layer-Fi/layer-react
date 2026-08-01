import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash-es'

import { usePnlDetailLinesInvalidator } from '@api/businesses/[business-id]/reports/profit-and-loss/lines/get'
import { useProfitAndLossReportCacheActions } from '@api/businesses/[business-id]/reports/profit-and-loss/get'
import { useProfitAndLossSummariesCacheActions } from '@api/businesses/[business-id]/reports/profit-and-loss-summaries/get'

const INVALIDATE_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export const useProfitAndLossGlobalInvalidator = () => {
  const { invalidate: invalidateProfitAndLossReport } = useProfitAndLossReportCacheActions()
  const { invalidate: invalidateProfitAndLossSummaries } = useProfitAndLossSummariesCacheActions()
  const { invalidate: invalidatePnlDetailLines } = usePnlDetailLinesInvalidator()

  const invalidateProfitAndLoss = useCallback(async () => {
    await invalidateProfitAndLossReport()
    await invalidateProfitAndLossSummaries()
    await invalidatePnlDetailLines()
  }, [
    invalidateProfitAndLossReport,
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

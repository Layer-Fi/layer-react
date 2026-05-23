import { useState } from 'react'

import { ReportControl } from '@schemas/reports/reportConfig'
import { useElementSize } from '@hooks/utils/size/useElementSize'
import {
  hasControl,
  useBaseUnifiedReport,
  useUnifiedReportDateSelectionMode,
  useUnifiedReportGroupByParam,
  useUnifiedReportReportingBasisParam,
} from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Stack, VStack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { DateGroupByComboBox } from '@components/DateSelection/DateGroupByComboBox'
import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'
import { UnifiedReportReportingBasisControl } from '@components/UnifiedReports/UnifiedReportReportingBasisControl'
import { UnifiedReportTagControl } from '@components/UnifiedReports/UnifiedReportTagControl'

import './unifiedReportControls.scss'

const COMPACT_DATE_SELECTION_BREAKPOINT = 560

const UnifiedReportDateSelection = ({ isCompact }: { isCompact: boolean }) => {
  const { baseReport } = useBaseUnifiedReport()
  const dateSelectionMode = useUnifiedReportDateSelectionMode()

  const hasDateRange = hasControl(baseReport, ReportControl.DateRange)
  const hasDate = hasControl(baseReport, ReportControl.Date)

  if (!hasDateRange && !hasDate) return null

  return (
    <VStack>
      {hasDateRange && <CombinedDateRangeSelection mode={dateSelectionMode} isCompact={isCompact} />}
      {hasDate && <CombinedDateSelection mode={dateSelectionMode} isCompact={isCompact} />}
    </VStack>
  )
}

export const UnifiedReportControls = () => {
  const { baseReport } = useBaseUnifiedReport()
  const { groupBy, setGroupBy } = useUnifiedReportGroupByParam()
  const { reportingBasis, setReportingBasis } = useUnifiedReportReportingBasisParam()
  const dateSelectionMode = useUnifiedReportDateSelectionMode()
  const [size, setSize] = useState(3)

  const containerRef = useElementSize<HTMLDivElement>((size) => {
    setSize(size.width)
  })

  const isCompact = size < COMPACT_DATE_SELECTION_BREAKPOINT

  const hasGroupBy = dateSelectionMode === 'full' && hasControl(baseReport, ReportControl.GroupBy)
  const hasYear = hasControl(baseReport, ReportControl.Year)
  const hasReportingBasis = hasControl(baseReport, ReportControl.ReportingBasis) && reportingBasis != null
  const tagControl = baseReport?.tagControl
  return (
    <VStack ref={containerRef} className='Layer__UnifiedReports__ControlsContainer'>
      <Stack
        direction='row'
        pb='md'
        pi='lg'
        gap='xs'
        className='Layer__UnifiedReports__Controls'
      >
        <UnifiedReportDateSelection isCompact={isCompact} />
        {(hasYear || hasGroupBy || hasReportingBasis || tagControl) && (
          <div className='Layer__UnifiedReports__AdditionalControls'>
            {hasYear && <GlobalYearPicker />}
            {hasGroupBy && <DateGroupByComboBox value={groupBy} onValueChange={setGroupBy} />}
            {tagControl && <UnifiedReportTagControl tagControl={tagControl} />}
            {hasReportingBasis && (
              <UnifiedReportReportingBasisControl
                value={reportingBasis}
                onValueChange={setReportingBasis}
              />
            )}
          </div>
        )}
      </Stack>
    </VStack>
  )
}

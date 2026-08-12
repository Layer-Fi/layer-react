import { useState } from 'react'

import { ReportControl } from '@schemas/features/unifiedReports/reportConfig'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useElementSize } from '@hooks/utils/size/useElementSize'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import {
  hasControl,
  useBaseUnifiedReport,
  useUnifiedReportDateSelectionMode,
  useUnifiedReportGroupByParam,
  useUnifiedReportReportingBasisParam,
} from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@blocks/DatePickers/DateSelection/CombinedDateRangeSelection'
import { CombinedDateSelection } from '@blocks/DatePickers/DateSelection/CombinedDateSelection'
import { DateGroupByComboBox } from '@blocks/DatePickers/DateSelection/DateGroupByComboBox'
import { GlobalYearPicker } from '@blocks/DatePickers/GlobalYearPicker/GlobalYearPicker'
import { UnifiedReportHeaderButtons } from '@features/unifiedReports/UnifiedReportHeaderButtons/UnifiedReportHeaderButtons'
import { UnifiedReportReportingBasisControl } from '@features/unifiedReports/UnifiedReportReportingBasisControl/UnifiedReportReportingBasisControl'
import { UnifiedReportTagControl } from '@features/unifiedReports/UnifiedReportTagControl/UnifiedReportTagControl'

import './unifiedReportControls.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__UnifiedReports__AdditionalControls: 'Layer__UnifiedReport__AdditionalControls',
})

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
  const { isDesktop } = useSizeClass()
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
      {!isDesktop && (
        <HStack
          pi='lg'
          pbs='lg'
          gap='xs'
          className='Layer__UnifiedReports__ControlsActions'
        >
          <UnifiedReportHeaderButtons variant='Mobile' />
        </HStack>
      )}
      <HStack
        pb='md'
        pi='lg'
        gap='xs'
        className='Layer__UnifiedReports__Controls'
      >
        <UnifiedReportDateSelection isCompact={isCompact} />
        {(hasYear || hasGroupBy || hasReportingBasis || tagControl) && (
          <div className={legacyClassNames('Layer__UnifiedReports__AdditionalControls')}>
            {hasYear && <GlobalYearPicker showLabel />}
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
      </HStack>
    </VStack>
  )
}

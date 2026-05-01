import { useState } from 'react'

import { ReportControl } from '@schemas/reports/reportConfig'
import { useElementSize } from '@hooks/utils/size/useElementSize'
import { hasControl, useBaseUnifiedReport, useUnifiedReportDateSelectionMode, useUnifiedReportGroupByParam } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Stack, VStack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { DateGroupByComboBox } from '@components/DateSelection/DateGroupByComboBox'
import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'

import './unifiedReportControls.scss'

const SMALL_BREAKPOINT = 560
const MEDIUM_BREAKPOINT = 760

type ControlsVariant = 'small' | 'medium' | 'large'

const getVariantForWidth = (width: number): ControlsVariant => {
  if (width >= MEDIUM_BREAKPOINT) return 'large'
  if (width >= SMALL_BREAKPOINT) return 'medium'
  return 'small'
}

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
  const dateSelectionMode = useUnifiedReportDateSelectionMode()
  const [size, setSize] = useState(3)

  const containerRef = useElementSize<HTMLDivElement>((size) => {
    setSize(size.width)
  })

  const variant = getVariantForWidth(size)

  const hasGroupBy = dateSelectionMode === 'full' && hasControl(baseReport, ReportControl.GroupBy)
  return (
    <Stack
      ref={containerRef}
      direction={variant === 'large' ? 'row' : 'column'}
      pb='md'
      pi='lg'
      gap='xs'
    >
      <UnifiedReportDateSelection isCompact={variant === 'small'} />
      {hasControl(baseReport, ReportControl.Year) && <GlobalYearPicker />}
      {hasGroupBy && (
        <div className='Layer__UnifiedReport__AdditionalControls' data-variant={variant}>
          <DateGroupByComboBox value={groupBy} onValueChange={setGroupBy} />
        </div>
      )}
    </Stack>
  )
}

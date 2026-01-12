import { useCallback, useContext } from 'react'

import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { UnifiedReportDateVariant, useUnifiedReportDateVariant, useUnifiedReportGroupBy } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { DateGroupByComboBox } from '@components/DateSelection/DateGroupByComboBox'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { UnifiedReportDownloadButton } from '@components/UnifiedReport/UnifiedReportDownloadButton'

import './unifiedReportTableHeader.scss'

type UnifiedReportTableHeaderProps = {
  dateSelectionMode: DateSelectionMode
}

export const UnifiedReportTableHeader = ({ dateSelectionMode }: UnifiedReportTableHeaderProps) => {
  const dateVariant = useUnifiedReportDateVariant()
  const groupBySetter = useUnifiedReportGroupBy()

  const { expanded, setExpanded } = useContext(ExpandableDataTableContext)
  const shouldCollapse = expanded === true
  const onClickExpandOrCollapse = useCallback(() => {
    if (shouldCollapse) {
      setExpanded({})
    }
    else {
      setExpanded(true)
    }
  }, [setExpanded, shouldCollapse])

  return (
    <HStack fluid justify='space-between' align='center' className='Layer__UnifiedReport__Header'>
      <HStack pi='md' gap='xs'>
        {dateVariant === UnifiedReportDateVariant.DateRange
          ? <CombinedDateRangeSelection mode={dateSelectionMode} />
          : <CombinedDateSelection mode={dateSelectionMode} />}
        {dateSelectionMode === 'full' && groupBySetter && (
          <DateGroupByComboBox value={groupBySetter.groupBy} onValueChange={groupBySetter.setGroupBy} />
        )}
      </HStack>
      <HStack pi='md' className='Layer__UnifiedReport__Header__SecondaryActions'>
        <Button variant='outlined' onClick={onClickExpandOrCollapse}>
          {shouldCollapse ? 'Collapse All' : 'Expand All'}
        </Button>
        <UnifiedReportDownloadButton dateSelectionMode={dateSelectionMode} />
      </HStack>
    </HStack>
  )
}

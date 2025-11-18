import { useCallback, useContext } from 'react'

import { UnifiedReportDateVariant, useUnifiedReportDateVariant } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'
import { DateSelection } from '@components/DateSelection/DateSelection'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { UnifiedReportDownloadButton } from '@components/UnifiedReport/download/UnifiedReportDownloadButton'

import './unifiedReportTableHeader.scss'

export const UnifiedReportTableHeader = () => {
  const dateVariant = useUnifiedReportDateVariant()

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
      <HStack pi='md'>
        {dateVariant === UnifiedReportDateVariant.DateRange
          ? <DateRangeSelection />
          : <DateSelection />}
      </HStack>
      <HStack pi='md' className='Layer__UnifiedReport__Header__SecondaryActions'>
        <Button variant='outlined' onClick={onClickExpandOrCollapse}>
          {shouldCollapse ? 'Collapse All' : 'Expand All'}
        </Button>
        <UnifiedReportDownloadButton />
      </HStack>
    </HStack>
  )
}

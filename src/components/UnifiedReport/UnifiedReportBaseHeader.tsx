import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { ReportControl } from '@schemas/reports/reportConfig'
import { hasControl, useBaseUnifiedReport, useUnifiedReportDateSelectionMode, useUnifiedReportGroupByParam } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { DateGroupByComboBox } from '@components/DateSelection/DateGroupByComboBox'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { UnifiedReportDownloadButton } from '@components/UnifiedReport/UnifiedReportDownloadButton'

import './unifiedReportBaseHeader.scss'

export const UnifiedReportBaseHeader = () => {
  const { t } = useTranslation()
  const { baseReport } = useBaseUnifiedReport()
  const { groupBy, setGroupBy } = useUnifiedReportGroupByParam()
  const dateSelectionMode = useUnifiedReportDateSelectionMode()

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
    <VStack gap='lg'>
      <HStack pis='lg' pbs='lg'>
        {baseReport
          ? <Span size='lg' weight='bold'>{baseReport.displayName}</Span>
          : <SkeletonLoader width='192px' height='24px' />}
      </HStack>
      <HStack fluid justify='space-between' align='end' pbe='lg' className='Layer__UnifiedReport__Header'>
        <HStack pi='lg' gap='xs'>
          {hasControl(baseReport, ReportControl.DateRange) && (
            <CombinedDateRangeSelection mode={dateSelectionMode} />
          )}
          {hasControl(baseReport, ReportControl.Date) && (
            <CombinedDateSelection mode={dateSelectionMode} />
          )}
          {dateSelectionMode === 'full' && hasControl(baseReport, ReportControl.GroupBy) && (
            <DateGroupByComboBox value={groupBy} onValueChange={setGroupBy} />
          )}
        </HStack>
        <HStack pi='lg' className='Layer__UnifiedReport__Header__SecondaryActions'>
          <Button variant='outlined' onClick={onClickExpandOrCollapse}>
            {shouldCollapse
              ? t('reports:action.collapse_all', 'Collapse All')
              : t('reports:action.expand_all', 'Expand All')}
          </Button>
          <UnifiedReportDownloadButton />
        </HStack>
      </HStack>
    </VStack>
  )
}

import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { UnifiedReportDateVariant, useActiveUnifiedReport, useUnifiedReportDateVariant, useUnifiedReportGroupByParam } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { DateGroupByComboBox } from '@components/DateSelection/DateGroupByComboBox'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { UnifiedReportDownloadButton } from '@components/UnifiedReport/UnifiedReportDownloadButton'

import './unifiedReportTableHeader.scss'

type UnifiedReportTableHeaderProps = {
  dateSelectionMode: DateSelectionMode
}

export const UnifiedReportTableHeader = ({ dateSelectionMode }: UnifiedReportTableHeaderProps) => {
  const { t } = useTranslation()
  const dateVariant = useUnifiedReportDateVariant()
  const groupBySetter = useUnifiedReportGroupByParam()
  const { report } = useActiveUnifiedReport()

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
        {report
          ? <Span size='lg' weight='bold'>{report.displayName}</Span>
          : <SkeletonLoader width='192px' height='24px' />}
      </HStack>
      <HStack fluid justify='space-between' align='end' pbe='lg' className='Layer__UnifiedReport__Header'>
        <HStack pi='lg' gap='xs'>
          {dateVariant === UnifiedReportDateVariant.DateRange
            ? <CombinedDateRangeSelection mode={dateSelectionMode} />
            : <CombinedDateSelection mode={dateSelectionMode} />}
          {dateSelectionMode === 'full' && groupBySetter && (
            <DateGroupByComboBox value={groupBySetter.groupBy} onValueChange={groupBySetter.setGroupBy} />
          )}
        </HStack>
        <HStack pi='lg' className='Layer__UnifiedReport__Header__SecondaryActions'>
          <Button variant='outlined' onClick={onClickExpandOrCollapse}>
            {shouldCollapse
              ? t('reports:action.collapse_all', 'Collapse All')
              : t('reports:action.expand_all', 'Expand All')}
          </Button>
          <UnifiedReportDownloadButton dateSelectionMode={dateSelectionMode} />
        </HStack>
      </HStack>
    </VStack>
  )
}

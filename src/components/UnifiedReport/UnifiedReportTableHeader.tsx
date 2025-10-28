import { useCallback, useContext, useMemo } from 'react'
import { Button } from '../ui/Button/Button'
import { HStack, VStack } from '../ui/Stack/Stack'
import { ExpandableDataTableContext } from '../ExpandableDataTable/ExpandableDataTableProvider'
import { DateSelection } from '../DateSelection/DateSelection'
import { UnifiedReportDateVariant, useUnifiedReportDateVariant } from '../../providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { DateRangeSelection } from '../DateSelection/DateRangeSelection'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { getActivationDate } from '../../utils/business'
import { endOfToday, startOfDay } from 'date-fns'
import { UnifiedReportDownloadButton } from './download/UnifiedReportDownloadButton'
import './unifiedReportTableHeader.scss'

export const UnifiedReportTableHeader = () => {
  const { business } = useLayerContext()
  const activationDate = useMemo(() => {
    const rawActivationDate = getActivationDate(business)
    if (!rawActivationDate) return null

    return startOfDay(rawActivationDate)
  }, [business])

  const dateParams = useMemo(() => ({
    minDate: activationDate,
    maxDate: endOfToday(),
  }), [activationDate])

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
    <VStack>
      <HStack justify='space-between' align='center' className='Layer__UnifiedReport__Header' pi='md' gap='xs'>
        {dateVariant === UnifiedReportDateVariant.DateRange
          ? <DateRangeSelection {...dateParams} />
          : <DateSelection {...dateParams} />}
        <HStack gap='xs'>
          <Button variant='outlined' onClick={onClickExpandOrCollapse}>
            {shouldCollapse ? 'Collapse All' : 'Expand All'}
          </Button>
          <UnifiedReportDownloadButton />
        </HStack>
      </HStack>
    </VStack>
  )
}

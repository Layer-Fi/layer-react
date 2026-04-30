import { useContext } from 'react'

import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { HStack } from '@ui/Stack/Stack'
import { DateGroupByComboBox } from '@components/DateSelection/DateGroupByComboBox'
import { CompareTagsMultiSelect } from '@components/ProfitAndLossCompareOptions/CompareTagsMultiSelect'

import './profitAndLossCompareOptions.scss'

export const ProfitAndLossCompareOptions = ({ isCompact = false }: { isCompact?: boolean }) => {
  const {
    comparisonConfig,
    comparisonPeriodMode,
    setComparisonPeriodMode,
  } = useContext(ProfitAndLossComparisonContext)

  const { dateSelectionMode } = useContext(ProfitAndLossContext)

  if (!comparisonConfig) {
    return null
  }

  const showGroupBy = comparisonConfig.showTimeSeriesComparison !== false && dateSelectionMode === 'full'
  const showTags = comparisonConfig.showTagComparison !== false

  if (!showGroupBy && !showTags) {
    return null
  }

  return (
    <HStack
      className='Layer__ProfitAndLossCompareOptions__Container'
      align='end'
      gap='xs'
      fluid
      data-compact={isCompact}
    >
      {showGroupBy && (
        <DateGroupByComboBox value={comparisonPeriodMode} onValueChange={setComparisonPeriodMode} />
      )}
      {showTags && <CompareTagsMultiSelect />}
    </HStack>
  )
}

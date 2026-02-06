import { useContext } from 'react'

import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { HStack } from '@ui/Stack/Stack'
import { DateGroupByComboBox } from '@components/DateSelection/DateGroupByComboBox'
import { CompareTagsMultiSelect } from '@components/ProfitAndLossCompareOptions/CompareTagsMultiSelect'

export const ProfitAndLossCompareOptions = () => {
  const {
    comparisonConfig,
    comparisonPeriodMode,
    setComparisonPeriodMode,
  } = useContext(ProfitAndLossComparisonContext)

  const { dateSelectionMode } = useContext(ProfitAndLossContext)

  if (!comparisonConfig) {
    return null
  }

  return (
    <HStack align='end' gap='xs'>
      {dateSelectionMode === 'full' && (
        <DateGroupByComboBox value={comparisonPeriodMode} onValueChange={setComparisonPeriodMode} />
      )}
      <CompareTagsMultiSelect />
    </HStack>
  )
}

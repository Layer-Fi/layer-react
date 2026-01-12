import { useContext } from 'react'
import type { StylesConfig } from 'react-select'

import { type TagComparisonOption } from '@internal-types/profit_and_loss'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { HStack } from '@ui/Stack/Stack'
import { DateGroupByComboBox } from '@components/DateSelection/DateGroupByComboBox'
import { MultiSelect } from '@components/Input/MultiSelect'

const selectStyles = {
  valueContainer: (styles) => {
    return {
      ...styles,
      flexWrap: 'nowrap',
    }
  },
} satisfies StylesConfig<TagComparisonOption, true>

export const ProfitAndLossCompareOptions = () => {
  const {
    setSelectedCompareOptions,
    compareOptions,
    selectedCompareOptions,
    comparisonConfig,
    comparisonPeriodMode,
    setComparisonPeriodMode,
  } = useContext(ProfitAndLossComparisonContext)

  const { dateSelectionMode } = useContext(ProfitAndLossContext)

  const tagComparisonSelectOptions = compareOptions.map(
    (tagComparisonOption) => {
      return {
        value: JSON.stringify(tagComparisonOption.tagFilterConfig),
        label: tagComparisonOption.displayName,
      }
    },
  )

  if (!comparisonConfig) {
    return null
  }

  return (
    <HStack align='center' gap='xs'>
      {dateSelectionMode === 'full' && (
        <DateGroupByComboBox value={comparisonPeriodMode} onValueChange={setComparisonPeriodMode} />
      )}
      <MultiSelect
        options={tagComparisonSelectOptions}
        onChange={values => setSelectedCompareOptions(values)}
        defaultValue={selectedCompareOptions?.map(option => ({
          value: JSON.stringify(option.tagFilterConfig),
          label: option.displayName,
        }))}
        value={selectedCompareOptions.map((tagComparisonOption) => {
          return {
            value: JSON.stringify(tagComparisonOption.tagFilterConfig),
            label: tagComparisonOption.displayName,
          }
        })}
        placeholder='Select views'
        styles={selectStyles}
        className='Layer__ProfitAndLoss__TagMultiSelect'
      />
    </HStack>
  )
}

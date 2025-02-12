import { useContext, useMemo } from 'react'
import { MultiSelect, Select } from '../Input'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'
import type { StylesConfig } from 'react-select'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { TagComparisonOption } from '../../types/profit_and_loss'

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
    setComparePeriods,
    setSelectedCompareOptions,
    isCompareDisabled,
    comparePeriods,
    compareOptions,
    selectedCompareOptions,
    comparisonConfig,
  } = useContext(ProfitAndLoss.ComparisonContext)

  const { rangeDisplayMode } = useGlobalDateRange()

  const periods = useMemo<number>(
    () => comparePeriods !== 0 ? comparePeriods : 1,
    [comparePeriods],
  )

  const timeComparisonOptions = [
    { value: 1, label: rangeDisplayMode === 'monthPicker' ? 'This month' : 'This year' },
    { value: 2, label: rangeDisplayMode === 'monthPicker' ? 'Last 2 months' : 'Last 2 years' },
    { value: 3, label: rangeDisplayMode === 'monthPicker' ? 'Last 3 months' : 'Last 3 years' },
  ]

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
    <div className='Layer__compare__options'>
      <Select
        options={timeComparisonOptions}
        onChange={e => setComparePeriods(e && e.value ? e.value : 1)}
        value={
          timeComparisonOptions.find(
            option => option.value === periods,
          )
        }
        placeholder={rangeDisplayMode === 'yearPicker' ? 'Compare years' : 'Compare months'}
        disabled={isCompareDisabled}
      />
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
        disabled={isCompareDisabled}
      />
    </div>
  )
}

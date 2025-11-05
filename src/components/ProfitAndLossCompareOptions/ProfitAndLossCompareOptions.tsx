import { Select } from '../Input/Select'
import { MultiSelect } from '../Input/MultiSelect'
import { useContext, useMemo } from 'react'
import type { StylesConfig } from 'react-select'
import { DateRangePickerMode } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { TagComparisonOption } from '../../types/profit_and_loss'
import { ReportKey, useReportModeWithFallback } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
import { ProfitAndLossComparisonContext } from '../../contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'

const selectStyles = {
  valueContainer: (styles) => {
    return {
      ...styles,
      flexWrap: 'nowrap',
    }
  },
} satisfies StylesConfig<TagComparisonOption, true>

function buildCompareOptions(rangeDisplayMode: DateRangePickerMode) {
  switch (rangeDisplayMode) {
    case 'monthPicker':
      return [
        { value: 1, label: 'This month' },
        { value: 2, label: 'Last 2 months' },
        { value: 3, label: 'Last 3 months' },
      ]
    case 'yearPicker':
      return [
        { value: 1, label: 'This year' },
        { value: 2, label: 'Last 2 years' },
        { value: 3, label: 'Last 3 years' },
      ]
    default:
      return [
        { value: 1, label: 'This period' },
        { value: 2, label: 'Last 2 periods' },
        { value: 3, label: 'Last 3 periods' },
      ]
  }
}

export const ProfitAndLossCompareOptions = () => {
  const {
    setComparePeriods,
    setSelectedCompareOptions,
    isPeriodsSelectEnabled,
    comparePeriods,
    compareOptions,
    selectedCompareOptions,
    comparisonConfig,
  } = useContext(ProfitAndLossComparisonContext)

  const rangeDisplayMode = useReportModeWithFallback(ReportKey.ProfitAndLoss, 'monthPicker')

  const periods = useMemo<number>(
    () => comparePeriods !== 0 ? comparePeriods : 1,
    [comparePeriods],
  )

  const timeComparisonOptions = buildCompareOptions(rangeDisplayMode)

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
        disabled={!isPeriodsSelectEnabled}
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
      />
    </div>
  )
}

import { useContext, useEffect, useMemo } from 'react'
import { MultiSelect, Select } from '../Input'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'
import type { MultiValue, StylesConfig } from 'react-select'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export interface ProfitAndLossCompareOptionsProps {
  tagComparisonOptions: TagComparisonOption[]
  defaultTagFilter: TagComparisonOption
  defaultPeriods?: number
}

export interface TagComparisonOption {
  displayName: string
  tagFilterConfig: TagViewConfig
}

export type TagViewConfig = {
  structure?: string
  tagFilters: TagFilterInput
}
export type TagFilterInput =
  | {
    tagKey: string
    tagValues: string[]
  }
  | 'None'

const selectStyles = {
  valueContainer: (styles) => {
    return {
      ...styles,
      flexWrap: 'nowrap',
    }
  },
} satisfies StylesConfig<TagComparisonOption, true>

export const ProfitAndLossCompareOptions = ({
  tagComparisonOptions,
  defaultTagFilter: defaultOption,
  defaultPeriods = 1,
}: ProfitAndLossCompareOptionsProps) => {
  const {
    setComparePeriods,
    setCompareOptions,
    isCompareDisabled,
    comparePeriods,
    compareOptions,
  } = useContext(ProfitAndLoss.ComparisonContext)

  const { rangeDisplayMode } = useGlobalDateRange()

  const periods = useMemo<number>(
    () => comparePeriods !== 0 ? comparePeriods : 1,
    [comparePeriods],
  )

  useEffect(() => {
    // Set default values in hooks if any is missing.
    if (comparePeriods < 1) {
      setComparePeriods(defaultPeriods)
    }
    if (compareOptions.length === 0) {
      setCompareOptions([defaultOption])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setCompareOptionnsInternal = (values: MultiValue<{ value: string, label: string }>) => {
    const options: TagComparisonOption[] = values.map(option =>
      tagComparisonOptions.find(
        t => JSON.stringify(t.tagFilterConfig) === option.value,
      ),
    ).filter(Boolean) as TagComparisonOption[]

    if (options.length === 0) {
      // Set default option if nothing selected
      setCompareOptions([defaultOption])
    }
    else {
      setCompareOptions(options)
    }
  }

  const timeComparisonOptions = [
    { value: 1, label: rangeDisplayMode === 'monthPicker' ? 'This month' : 'This year' },
    { value: 2, label: rangeDisplayMode === 'monthPicker' ? 'Last 2 months' : 'Last 2 years' },
    { value: 3, label: rangeDisplayMode === 'monthPicker' ? 'Last 3 months' : 'Last 3 years' },
  ]

  const tagComparisonSelectOptions = tagComparisonOptions.map(
    (tagComparisonOption) => {
      return {
        value: JSON.stringify(tagComparisonOption.tagFilterConfig),
        label: tagComparisonOption.displayName,
      }
    },
  )

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
        onChange={(e) => {
          setCompareOptionnsInternal(
            e,

          )
        }}
        defaultValue={compareOptions?.map(option => ({
          value: JSON.stringify(option.tagFilterConfig),
          label: option.displayName,
        }))}
        value={compareOptions.map((tagComparisonOption) => {
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

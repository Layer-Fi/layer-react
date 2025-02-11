import { useContext, useEffect, useState } from 'react'
import { MultiSelect, Select } from '../Input'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'
import type { StylesConfig } from 'react-select'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export interface ProfitAndLossCompareOptionsProps {
  tagComparisonOptions: TagComparisonOption[]
  defaultTagFilter: TagComparisonOption
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

const ALLOWED_COMPARE_MODES = ['monthPicker', 'yearPicker']

const hasNoneDefaultTag = (compareOptions?: TagComparisonOption[]) => {
  return compareOptions?.some(option => option.tagFilterConfig.tagFilters !== 'None')
}

export const ProfitAndLossCompareOptions = ({
  tagComparisonOptions,
  defaultTagFilter: defaultOption,
}: ProfitAndLossCompareOptionsProps) => {
  const {
    setComparePeriods,
    setCompareOptions,
    setCompareMode,
    compareMode,
    comparePeriods,
    compareOptions,
  } = useContext(ProfitAndLoss.ComparisonContext)

  const { rangeDisplayMode } = useGlobalDateRange()

  const [periods, setPeriods] = useState<number>(
    comparePeriods !== 0 ? comparePeriods : 1,
  )
  const [toggle, setToggle] = useState<TagComparisonOption[]>(
    compareOptions?.length > 0 ? compareOptions : [defaultOption],
  )

  const isCompareDisabled = !ALLOWED_COMPARE_MODES.includes(rangeDisplayMode)

  useEffect(() => {
    if (isCompareDisabled && compareMode) {
      setCompareMode(false)
      return
    }

    if (
      (comparePeriods > 1 || hasNoneDefaultTag(compareOptions))
      && !compareMode
      && !isCompareDisabled
    ) {
      setCompareMode(true)
      return
    }

    if (comparePeriods < 2 && !hasNoneDefaultTag(compareOptions) && compareMode) {
      setCompareMode(false)
      return
    }
  }, [isCompareDisabled, compareMode, comparePeriods, compareOptions, setCompareMode])

  useEffect(() => {
    if (periods === 0 && toggle.length > 1) {
      setPeriods(1)
    }
    else if (periods !== comparePeriods && setComparePeriods) {
      setComparePeriods(periods)
    }
  }, [periods])

  useEffect(() => {
    if (toggle.length === 0) {
      setToggle(compareOptions?.length > 0 ? compareOptions : [defaultOption])
    }
    else if (JSON.stringify(toggle) !== JSON.stringify(compareOptions) && setCompareOptions) {
      setCompareOptions(toggle)
    }
  }, [toggle, compareOptions, setCompareOptions, defaultOption])

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
        onChange={e => setPeriods(e && e.value ? e.value : 0)}
        value={
          comparePeriods === 0
            ? null
            : timeComparisonOptions.find(
              option => option.value === comparePeriods,
            )
        }
        placeholder={rangeDisplayMode === 'yearPicker' ? 'Compare years' : 'Compare months'}
        disabled={isCompareDisabled}
      />
      <MultiSelect
        options={tagComparisonSelectOptions}
        onChange={(e) => {
          setToggle(
            e
              .map(option =>
                tagComparisonOptions.find(
                  t => JSON.stringify(t.tagFilterConfig) === option.value,
                ),
              )
              .filter(Boolean) as TagComparisonOption[],
          )
        }}
        defaultValue={toggle?.map(option => ({
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

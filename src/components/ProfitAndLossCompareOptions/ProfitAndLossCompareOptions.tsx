import React, { useContext, useEffect, useState } from 'react'
import { SwitchButton } from '../Button'
import { MultiSelect, Select } from '../Input'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'

export interface ProfitAndLossCompareOptionsProps {
  tagComparisonOptions: TagComparisonOption[]
  defaultTagFilter: TagComparisonOption
}

export interface TagComparisonOption {
  displayName: string
  tagFilters: TagFilterInput
}

export type TagFilterInput =
  | {
      tagKey: string
      tagValues: string[]
    }
  | 'None'

export const ProfitAndLossCompareOptions = ({
  tagComparisonOptions,
  defaultTagFilter: defaultOption,
}: ProfitAndLossCompareOptionsProps) => {
  const {
    setCompareMonths,
    setCompareOptions,
    compareMode,
    refetch,
    compareMonths,
    compareOptions,
  } = useContext(ProfitAndLoss.ComparisonContext)

  const { dateRange } = useContext(ProfitAndLoss.Context)

  useEffect(() => {
    if (compareMode) {
      refetch({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
    }
  }, [compareMode, compareOptions, compareMonths])

  const [months, setMonths] = useState<number>(1)
  const [toggle, setToggle] = useState<TagComparisonOption[]>([defaultOption])

  useEffect(() => {
    if (months === 0 && toggle.length > 1) {
      setMonths(1)
    }
    setCompareMonths && setCompareMonths(months)
  }, [months])

  useEffect(() => {
    if (toggle.length === 0) {
      setToggle([defaultOption])
    } else {
      setCompareOptions && setCompareOptions(toggle)
    }
  }, [toggle])

  const timeComparisonOptions = [
    { value: 1, label: 'This month' },
    { value: 2, label: 'Last 2 months' },
    { value: 3, label: 'Last 3 months' },
  ]

  const tagComparisonSelectOptions = tagComparisonOptions.map(
    tagComparisonOption => {
      return {
        value:
          tagComparisonOption.tagFilters === 'None'
            ? 'None'
            : tagComparisonOption.tagFilters.tagKey,
        label: tagComparisonOption.displayName,
      }
    },
  )

  return (
    <div className='Layer__compare__options'>
      <Select
        options={timeComparisonOptions}
        onChange={e => setMonths(e && e.value ? e.value : 0)}
        value={
          months === 0
            ? null
            : timeComparisonOptions.find(option => option.value === months)
        }
        placeholder='Compare months'
      />
      <MultiSelect
        options={tagComparisonSelectOptions}
        onChange={e => {
          setToggle(
            e
              .map(option =>
                tagComparisonOptions.find(t => t.tagFilters === option.value),
              )
              .filter(Boolean) as TagComparisonOption[],
          )
        }}
        defaultValue={toggle?.map(option => ({
          value:
            option.tagFilters === 'None' ? 'None' : option.tagFilters.tagKey,
          label: option.displayName,
        }))}
        placeholder='Select views'
      />
    </div>
  )
}

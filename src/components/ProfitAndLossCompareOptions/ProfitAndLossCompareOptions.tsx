import React, { useContext, useEffect, useState } from 'react'
import { MultiSelect, Select } from '../Input'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'

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
  valueContainer: (styles: any) => {
    return {
      ...styles,
      flexWrap: 'nowrap',
    }
  },
}

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

  const [initialDone, setInitialDone] = useState(false)

  useEffect(() => {
    if (initialDone) {
      fetchData()
    } else {
      setInitialDone(true)
    }
  }, [compareMode, compareOptions, compareMonths])

  const fetchData = () => {
    if (compareMode) {
      refetch({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
    }
  }

  const [months, setMonths] = useState<number>(
    compareMonths !== 0 ? compareMonths : 1,
  )
  const [toggle, setToggle] = useState<TagComparisonOption[]>(
    compareOptions?.length > 0 ? compareOptions : [defaultOption],
  )

  useEffect(() => {
    if (months === 0 && toggle.length > 1) {
      setMonths(1)
    } else if (months !== compareMonths) {
      setCompareMonths && setCompareMonths(months)
    }
  }, [months])

  useEffect(() => {
    if (toggle.length === 0) {
      setToggle(compareOptions?.length > 0 ? compareOptions : [defaultOption])
    } else if (JSON.stringify(toggle) !== JSON.stringify(compareOptions)) {
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
        value: JSON.stringify(tagComparisonOption.tagFilterConfig),
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
          compareMonths === 0
            ? null
            : timeComparisonOptions.find(
                option => option.value === compareMonths,
              )
        }
        placeholder='Compare months'
      />
      <MultiSelect
        options={tagComparisonSelectOptions}
        onChange={e => {
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
        value={compareOptions.map(tagComparisonOption => {
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

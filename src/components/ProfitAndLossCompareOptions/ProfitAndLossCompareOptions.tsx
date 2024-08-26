import React, { useContext, useEffect, useState } from 'react'
import { SwitchButton } from '../Button'
import { Select } from '../Input'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'

const DEFAULT_SWITCH_OPTIONS = ['PC', 'MSO']

export const ProfitAndLossCompareOptions = () => {
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

  const [months, setMonths] = useState<number>(0)
  const [toggle, setToggle] = useState<string[]>(['Total'])

  useEffect(() => {
    if (months > 0 && toggle.length === 0) {
      handleSwitch('Total', true)
    }
    setCompareMonths && setCompareMonths(months)
  }, [months])

  useEffect(() => {
    if (toggle.length === 0 && months > 0) {
      setMonths(0)
      handleSwitch('Total', true)
    }
    if (toggle.length > 1 && months === 0) {
      setMonths(2)
    }
    setCompareOptions && setCompareOptions(toggle)
  }, [toggle])

  const handleSwitch = (name: string, value: boolean) => {
    let updatedToggle = [...toggle]

    if (value) {
      0
      if (!updatedToggle.includes(name)) {
        updatedToggle = [...updatedToggle, name]
      }
    } else {
      0
      if (
        updatedToggle.length > 1 ||
        (name !== 'Total' && updatedToggle.length === 1)
      ) {
        updatedToggle = updatedToggle.filter(item => item !== name)
      }
    }

    updatedToggle = updatedToggle
      .filter(item => item !== 'Total')
      .sort()
      .concat(updatedToggle.includes('Total') ? ['Total'] : [])

    setToggle(updatedToggle)
  }

  return (
    <div className='Layer__compare__options'>
      <Select
        options={[
          { value: 2, label: 'Compare last month' },
          { value: 3, label: 'Compare 3 month' },
          { value: null, label: "Don't compare" },
        ]}
        onChange={e => setMonths(e && e.value ? e.value : 0)}
        value={
          months === 0
            ? null
            : {
                value: months,
                label: `Compare ${
                  months === 2 ? 'last month' : months + ' ' + 'months'
                }`,
              }
        }
        placeholder='Compare months'
      />
      <div className='Layer__compare__switch__options'>
        <SwitchButton
          onChange={checked => handleSwitch('Total', checked)}
          checked={toggle.includes('Total')}
        >
          Show total
        </SwitchButton>
        {DEFAULT_SWITCH_OPTIONS.map(option => (
          <SwitchButton
            key={option}
            onChange={checked => handleSwitch(option, checked)}
            checked={toggle.includes(option)}
          >
            {option}
          </SwitchButton>
        ))}
      </div>
    </div>
  )
}

import React, { useContext, useEffect, useState } from 'react'
import { SwitchButton } from '../Button'
import { Select } from '../Input'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'

const DEFAULT_SWITCH_OPTIONS = ['Total', 'PC', 'MSO']

export const ProfitAndLossCompareOptions = () => {
  const { setCompareMonths, setCompareOptions } = useContext(
    ProfitAndLoss.Context,
  )

  const [months, setMonths] = useState<number>(0)
  const [toggle, setToggle] = useState<string[]>([])

  useEffect(() => {
    setCompareMonths && setCompareMonths(months)
  }, [months])

  useEffect(() => {
    setCompareOptions && setCompareOptions(toggle)
  }, [toggle])

  const handleSwitch = (name: string, value: boolean) => {
    if (value) {
      setToggle([...toggle, name])
    } else {
      setToggle(toggle.filter(item => item !== name))
    }
  }

  return (
    <div className='Layer__compare__options'>
      <Select
        options={[
          { value: 1, label: 'Compare last month' },
          { value: 3, label: 'Compare 3 month' },
        ]}
        onChange={e => setMonths(e.value)}
        placeholder='Compare months'
      />
      <div className='Layer__compare__switch__options'>
        {DEFAULT_SWITCH_OPTIONS.map(option => (
          <SwitchButton
            key={option}
            onChange={checked => handleSwitch(option, checked)}
          >
            {option}
          </SwitchButton>
        ))}
      </div>
    </div>
  )
}

import { useCallback, useMemo } from 'react'
import { getYear } from 'date-fns'

import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { ComboBox } from '@ui/ComboBox/ComboBox'

import './globalYearPicker.scss'

type YearOption = {
  label: string
  value: string
}

const toYearOption = (year: number): YearOption => {
  const yearString = String(year)
  return { label: yearString, value: yearString }
}

export const GlobalYearPicker = () => {
  const activationDate = useBusinessActivationDate()
  const { setYear } = useGlobalDateRangeActions()
  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'year' })

  const currentYear = getYear(new Date())
  const selectedYear = getYear(startDate)

  const yearOptions = useMemo(() => {
    const activationYear = activationDate ? getYear(activationDate) : currentYear
    const count = currentYear - activationYear + 1

    return Array.from({ length: count }, (_, i) => toYearOption(currentYear - i))
  }, [activationDate, currentYear])

  const selectedYearOption = yearOptions.find(opt => opt.value === String(selectedYear)) ?? yearOptions[0]

  const onChange = useCallback((option: YearOption | null) => {
    if (option) {
      const year = Number(option.value)
      setYear({ startDate: new Date(year, 0, 1) })
    }
  }, [setYear])

  return (
    <ComboBox
      selectedValue={selectedYearOption}
      onSelectedValueChange={onChange}
      options={yearOptions}
      isSearchable={false}
      isClearable={false}
      aria-label='Select year'
      className='Layer__GlobalYearPicker'
    />
  )
}

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

export const GlobalYearPicker = () => {
  const activationDate = useBusinessActivationDate()

  const { setYear } = useGlobalDateRangeActions()
  const { startDate } = useGlobalDateRange({ displayMode: 'full' })

  const currentYear = getYear(new Date())
  const selectedYear = getYear(startDate)

  const yearOptions = useMemo<YearOption[]>(() => {
    const activationYear = activationDate ? getYear(activationDate) : currentYear
    const years: YearOption[] = []

    for (let year = currentYear; year >= activationYear; year--) {
      years.push({ label: String(year), value: String(year) })
    }

    return years
  }, [activationDate, currentYear])

  const selectedYearOption = useMemo(() => {
    return yearOptions.find(opt => opt.value === String(selectedYear)) || yearOptions[0]
  }, [yearOptions, selectedYear])

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

import { useCallback, useMemo } from 'react'
import { type ZonedDateTime } from '@internationalized/date'

import { ComboBox } from '@ui/ComboBox/ComboBox'

import './yearPicker.scss'

type YearOption = {
  label: string
  value: string
}

const toYearOption = (year: number): YearOption => {
  const yearString = String(year)
  return { label: yearString, value: yearString }
}

type YearPickerProps = {
  label?: string
  year: number
  onChange: (year: number) => void
  minDate?: ZonedDateTime | null
  maxDate?: ZonedDateTime | null
  isDisabled?: boolean
}

export const YearPicker = ({
  label = 'Select year',
  year,
  onChange,
  minDate = null,
  maxDate = null,
  isDisabled = false,
}: YearPickerProps) => {
  const minYear = minDate?.year ?? null
  const maxYear = maxDate?.year ?? null

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const effectiveMinYear = minYear ?? currentYear - 10
    const effectiveMaxYear = maxYear ?? currentYear

    const count = effectiveMaxYear - effectiveMinYear + 1
    if (count <= 0) return []

    return Array.from({ length: count }, (_, i) => toYearOption(effectiveMaxYear - i))
  }, [minYear, maxYear])

  const selectedYearOption = useMemo(() => {
    return yearOptions.find(opt => opt.value === String(year)) ?? yearOptions[0] ?? null
  }, [yearOptions, year])

  const handleChange = useCallback((option: YearOption | null) => {
    if (option) {
      onChange(Number(option.value))
    }
  }, [onChange])

  return (
    <ComboBox
      selectedValue={selectedYearOption}
      onSelectedValueChange={handleChange}
      options={yearOptions}
      isSearchable={false}
      isClearable={false}
      isDisabled={isDisabled}
      aria-label={label}
      className='Layer__YearPicker'
    />
  )
}

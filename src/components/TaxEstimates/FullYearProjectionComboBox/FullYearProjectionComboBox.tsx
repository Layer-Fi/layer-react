import { useCallback } from 'react'
import { getYear } from 'date-fns'

import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { ComboBox } from '@ui/ComboBox/ComboBox'

import './fullYearProjectionComboBox.scss'

type ProjectionOption = {
  label: string
  value: string
  valueBool: boolean
}

const YearToDateOption = { label: 'Year to date', value: 'ytd', valueBool: false }
const FullYearProjectionOption = { label: 'Full year projection', value: 'full-year', valueBool: true }

const PROJECTION_OPTIONS: ReadonlyArray<ProjectionOption> = [
  YearToDateOption,
  FullYearProjectionOption,
]

export const FullYearProjectionComboBox = () => {
  const { fullYearProjection, setFullYearProjection } = useFullYearProjection()
  const { year } = useTaxEstimatesYear()

  const selectedValue = fullYearProjection
    ? FullYearProjectionOption
    : YearToDateOption

  const handleChange = useCallback((option: ProjectionOption | null) => {
    setFullYearProjection(option?.valueBool ?? false)
  }, [setFullYearProjection])

  if (year !== getYear(new Date())) return null

  return (
    <ComboBox<ProjectionOption>
      className='Layer__FullYearProjectionComboBox'
      options={PROJECTION_OPTIONS}
      selectedValue={selectedValue}
      onSelectedValueChange={handleChange}
      isClearable={false}
      isSearchable={false}
    />
  )
}

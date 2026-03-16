import { useCallback, useMemo } from 'react'
import { getYear } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { ComboBox } from '@ui/ComboBox/ComboBox'

import './fullYearProjectionComboBox.scss'

type ProjectionOption = {
  label: string
  value: string
  valueBool: boolean
}

export const FullYearProjectionComboBox = () => {
  const { t } = useTranslation()
  const { fullYearProjection, setFullYearProjection } = useFullYearProjection()
  const { year } = useTaxEstimatesYear()

  const options = useMemo<ProjectionOption[]>(
    () => [
      { label: t('taxEstimates.yearToDate', 'Year to date'), value: 'ytd', valueBool: false },
      { label: t('taxEstimates.fullYearProjection', 'Full year projection'), value: 'full-year', valueBool: true },
    ],
    [t],
  )

  const selectedValue = fullYearProjection ? options[1] : options[0]

  const handleChange = useCallback((option: ProjectionOption | null) => {
    setFullYearProjection(option?.valueBool ?? false)
  }, [setFullYearProjection])

  if (year !== getYear(new Date())) return null

  return (
    <ComboBox<ProjectionOption>
      className='Layer__FullYearProjectionComboBox'
      options={options}
      selectedValue={selectedValue}
      onSelectedValueChange={handleChange}
      isClearable={false}
      isSearchable={false}
    />
  )
}

import { useCallback } from 'react'

import { DateGroupBy } from '@schemas/reports/unifiedReport'
import { ComboBox } from '@ui/ComboBox/ComboBox'

import './dateGroupByComboBox.scss'

type DateGroupByOption = {
  label: string
  value: DateGroupBy
}

const DateGroupByOptionConfig = {
  [DateGroupBy.AllTime]: { label: 'All time', value: DateGroupBy.AllTime },
  [DateGroupBy.Month]: { label: 'Compare by month', value: DateGroupBy.Month },
  [DateGroupBy.Year]: { label: 'Compare by year', value: DateGroupBy.Year },
}
const options = Object.values(DateGroupByOptionConfig)

type DateGroupByComboBoxProps = {
  value: DateGroupBy | null
  onValueChange: (value: DateGroupBy | null) => void
}

export const DateGroupByComboBox = ({ value, onValueChange }: DateGroupByComboBoxProps) => {
  const selectedOption = value ? DateGroupByOptionConfig[value] : null
  const onSelectedValueChange = useCallback((option: DateGroupByOption | null) => {
    onValueChange(option?.value || null)
  }, [onValueChange])

  return (
    <ComboBox
      className='Layer__DateGroupByComboBox'
      options={options}
      onSelectedValueChange={onSelectedValueChange}
      selectedValue={selectedOption}
      isSearchable={false}
      isClearable={false}
    />
  )
}

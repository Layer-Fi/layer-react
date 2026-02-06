import { useCallback, useId } from 'react'

import { DateGroupBy } from '@schemas/reports/unifiedReport'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

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

  const inputId = useId()

  return (
    <VStack className='Layer__DateGroupByComboBox__Container'>
      <Label pbe='3xs' size='sm' htmlFor={inputId}>Group by</Label>
      <ComboBox
        className='Layer__DateGroupByComboBox'
        options={options}
        onSelectedValueChange={onSelectedValueChange}
        selectedValue={selectedOption}
        isSearchable={false}
        isClearable={false}
        inputId={inputId}
      />
    </VStack>
  )
}

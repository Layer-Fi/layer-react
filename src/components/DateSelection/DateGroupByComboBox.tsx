import { useCallback, useId } from 'react'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

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
  [DateGroupBy.AllTime]: { label: i18next.t('allTime', 'All time'), value: DateGroupBy.AllTime },
  [DateGroupBy.Month]: { label: i18next.t('month', 'Month'), value: DateGroupBy.Month },
  [DateGroupBy.Year]: { label: i18next.t('year', 'Year'), value: DateGroupBy.Year },
}
const options = Object.values(DateGroupByOptionConfig)

type DateGroupByComboBoxProps = {
  value: DateGroupBy | null
  onValueChange: (value: DateGroupBy | null) => void
}

export const DateGroupByComboBox = ({ value, onValueChange }: DateGroupByComboBoxProps) => {
  const { t } = useTranslation()
  const selectedOption = value ? DateGroupByOptionConfig[value] : null
  const onSelectedValueChange = useCallback((option: DateGroupByOption | null) => {
    onValueChange(option?.value || null)
  }, [onValueChange])

  const inputId = useId()

  return (
    <VStack className='Layer__DateGroupByComboBox__Container'>
      <Label pbe='3xs' size='sm' htmlFor={inputId}>{t('groupBy', 'Group by')}</Label>
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

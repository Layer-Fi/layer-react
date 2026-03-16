import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DateGroupBy } from '@schemas/reports/unifiedReport'
import { translationKey } from '@utils/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { createDateGroupByOnChange, type GroupByOption } from '@components/DateSelection/dateGroupByComboBoxUtils'

import './dateGroupByComboBox.scss'

const DATE_GROUP_BY_CONFIG = [
  { value: DateGroupBy.AllTime, ...translationKey('date.allTime', 'All time') },
  { value: DateGroupBy.Month, ...translationKey('date.month', 'Month') },
  { value: DateGroupBy.Year, ...translationKey('date.year', 'Year') },
]

type DateGroupByComboBoxProps = {
  value: DateGroupBy | null
  onValueChange: (value: DateGroupBy | null) => void
}

export const DateGroupByComboBox = ({ value, onValueChange }: DateGroupByComboBoxProps) => {
  const { t } = useTranslation()

  const options = useMemo<GroupByOption[]>(
    () => DATE_GROUP_BY_CONFIG.map((opt) => {
      const { i18nKey, defaultValue } = opt
      return { value: opt.value, label: t(i18nKey, defaultValue) }
    }),
    [t],
  )

  const selectedOption = value ? (options.find(o => o.value === value) ?? null) : null
  const onSelectedValueChange = useMemo(
    () => createDateGroupByOnChange(onValueChange),
    [onValueChange],
  )

  const inputId = useId()

  return (
    <VStack className='Layer__DateGroupByComboBox__Container'>
      <Label pbe='3xs' size='sm' htmlFor={inputId}>{t('reports.groupBy', 'Group by')}</Label>
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

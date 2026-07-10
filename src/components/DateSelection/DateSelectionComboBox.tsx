import { useCallback, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePreset } from '@utils/date/dateRangePresets'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

type DateSelectionOption = {
  label: string
  value: DatePreset
}

type DateSelectionComboBoxProps = {
  datePreset: DatePreset
  setDatePreset: (datePreset: Exclude<DatePreset, DatePreset.Custom>) => void
  showLabel?: boolean
}

export const DateSelectionComboBox = ({
  datePreset,
  setDatePreset,
  showLabel = false,
}: DateSelectionComboBoxProps) => {
  const { t } = useTranslation()

  const allOptions = useMemo<DateSelectionOption[]>(
    () => [
      { value: DatePreset.ThisMonth, label: t('date:label.this_month', 'This Month') },
      { value: DatePreset.LastMonth, label: t('date:label.last_month', 'Last Month') },
      { value: DatePreset.ThisQuarter, label: t('date:label.this_quarter', 'This Quarter') },
      { value: DatePreset.LastQuarter, label: t('date:label.last_quarter', 'Last Quarter') },
      { value: DatePreset.ThisYear, label: t('date:label.this_year', 'This Year') },
      { value: DatePreset.LastYear, label: t('date:label.last_year', 'Last Year') },
      { value: DatePreset.AllTime, label: t('date:label.all_time', 'All Time') },
      { value: DatePreset.Custom, label: t('date:label.custom', 'Custom') },
    ],
    [t],
  )

  // Selectable options exclude Custom — it only appears as a (non-selectable) label
  // when the range doesn't match a named preset.
  const options = allOptions.filter(o => o.value !== DatePreset.Custom)
  const selectedOption = allOptions.find(o => o.value === datePreset) ?? null

  const onSelectedValueChange = useCallback((option: DateSelectionOption | null) => {
    if (option === null) return

    const nextPreset = option.value
    if (nextPreset === DatePreset.Custom) return

    setDatePreset(nextPreset)
  }, [setDatePreset])

  const inputId = useId()

  const label = t('reports:label.report_period', 'Report period')
  const additionalAriaProps = !showLabel && { 'aria-label': label }

  return (
    <VStack>
      {showLabel && <Label pbe='3xs' size='sm' htmlFor={inputId}>{label}</Label>}
      <ComboBox
        options={options}
        onSelectedValueChange={onSelectedValueChange}
        selectedValue={selectedOption}
        isSearchable={false}
        isClearable={false}
        inputId={inputId}
        {...additionalAriaProps}
      />
    </VStack>
  )
}

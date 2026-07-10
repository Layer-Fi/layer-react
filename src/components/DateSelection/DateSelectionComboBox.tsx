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
  /** The store's active preset, shown as the selected option. */
  preset: DatePreset
  /** Set the range by preset; selecting an option calls it with `{ preset }`. */
  setPresetRange: (options: { preset: Exclude<DatePreset, DatePreset.Custom> }) => void
  /** Whether to offer the "All Time" option. */
  includeAllTime?: boolean
  showLabel?: boolean
}

export const DateSelectionComboBox = ({
  preset,
  setPresetRange,
  includeAllTime = false,
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
      ...(includeAllTime ? [{ value: DatePreset.AllTime, label: t('date:label.all_time', 'All Time') }] : []),
      { value: DatePreset.Custom, label: t('date:label.custom', 'Custom') },
    ],
    [t, includeAllTime],
  )

  // Selectable options exclude Custom — it only appears as a (non-selectable) label
  // when the range doesn't match a named preset.
  const options = allOptions.filter(o => o.value !== DatePreset.Custom)
  const selectedOption = allOptions.find(o => o.value === preset) ?? null

  const onSelectedValueChange = useCallback((option: DateSelectionOption | null) => {
    if (option === null) return

    const nextPreset = option.value
    if (nextPreset === DatePreset.Custom) return

    setPresetRange({ preset: nextPreset })
  }, [setPresetRange])

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

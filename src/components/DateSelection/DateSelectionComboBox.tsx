import { useCallback, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePreset, type DateRange } from '@utils/date/dateRange'
import { useDatePresets } from '@hooks/utils/dates/useDatePresets'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

type DateSelectionOption = {
  label: string
  value: DatePreset
  isDisabled?: boolean
}

type DateSelectionComboBoxProps = {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  showLabel?: boolean
}

export const DateSelectionComboBox = ({ dateRange, setDateRange, showLabel = false }: DateSelectionComboBoxProps) => {
  const { t } = useTranslation()
  const { business } = useLayerContext()
  const [lastPreset, setLastPreset] = useState<DatePreset | null>(null)
  const { rangeForSelectablePreset, findMatchingPresetForDateRange } = useDatePresets()

  const derivedPresetForDateRange = findMatchingPresetForDateRange(dateRange, lastPreset)

  // "All Time" starts at the business activation date, which is unknown until
  // the business resolves. Disable it while loading so a selection can't land
  // on the fallback minimum (1970); once resolved it becomes selectable and
  // computes the correct activation-based range.
  const isBusinessLoading = business === undefined

  const allPresetOptions = useMemo<DateSelectionOption[]>(
    () => [
      { value: DatePreset.ThisMonth, label: t('date:label.this_month', 'This Month') },
      { value: DatePreset.LastMonth, label: t('date:label.last_month', 'Last Month') },
      { value: DatePreset.ThisQuarter, label: t('date:label.this_quarter', 'This Quarter') },
      { value: DatePreset.LastQuarter, label: t('date:label.last_quarter', 'Last Quarter') },
      { value: DatePreset.ThisYear, label: t('date:label.this_year', 'This Year') },
      { value: DatePreset.LastYear, label: t('date:label.last_year', 'Last Year') },
      { value: DatePreset.AllTime, label: t('date:label.all_time', 'All Time'), isDisabled: isBusinessLoading },
      { value: DatePreset.Custom, label: t('date:label.custom', 'Custom') },
    ],
    [t, isBusinessLoading],
  )

  const selectablePresetOptions = allPresetOptions.filter(o => o.value !== DatePreset.Custom)
  const selectedPresetOption = allPresetOptions.find(o => o.value === (derivedPresetForDateRange ?? DatePreset.Custom)) ?? null

  const onSelectedValueChange = useCallback((option: DateSelectionOption | null) => {
    if (option === null) return

    if (option.value === DatePreset.Custom) return

    const nextPreset = option.value
    setLastPreset(nextPreset)

    const nextRange = rangeForSelectablePreset(nextPreset)
    setDateRange(nextRange)
  }, [setDateRange, rangeForSelectablePreset])

  const inputId = useId()

  const label = t('date:label.time_period', 'Time period')
  const additionalAriaProps = !showLabel && { 'aria-label': label }

  return (
    <VStack>
      {showLabel && <Label pbe='3xs' size='sm' htmlFor={inputId}>{label}</Label>}
      <ComboBox
        options={selectablePresetOptions}
        onSelectedValueChange={onSelectedValueChange}
        selectedValue={selectedPresetOption}
        isSearchable={false}
        isClearable={false}
        inputId={inputId}
        {...additionalAriaProps}
      />
    </VStack>
  )
}

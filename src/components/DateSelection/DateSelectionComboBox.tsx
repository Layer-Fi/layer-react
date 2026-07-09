import { useCallback, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getActivationDate } from '@utils/business'
import { type DateRange } from '@utils/date/dateRange'
import { DatePreset, presetForDateRange, rangeForAllTime, rangeForPreset } from '@utils/date/dateRangePresets'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

type DateSelectionOption = {
  label: string
  value: DatePreset
}

type DateSelectionComboBoxProps = {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  /**
   * The store's active preset, if the store tracks it. When provided (and not
   * `Custom`) it is authoritative for what the combo box shows — this is how the
   * `AllTime` preset stays selected, since its range cannot be derived without
   * context. When omitted, the preset is derived from the range.
   */
  preset?: DatePreset | null
  /**
   * Set the range together with the preset it represents. Preferred over
   * `setDateRange` when the store tracks the preset. Falls back to `setDateRange`.
   */
  setPresetRange?: (options: { preset: DatePreset, startDate: Date, endDate: Date }) => void
  /** Whether to offer the "All Time" option. */
  includeAllTime?: boolean
  showLabel?: boolean
}

export const DateSelectionComboBox = ({
  dateRange,
  setDateRange,
  preset,
  setPresetRange,
  includeAllTime = false,
  showLabel = false,
}: DateSelectionComboBoxProps) => {
  const { t } = useTranslation()
  const [lastPreset, setLastPreset] = useState<DatePreset | null>(null)
  const { business } = useLayerContext()
  const activationDate = getActivationDate(business)

  // A stored, concrete preset wins (it carries intent the range can't express,
  // e.g. AllTime); otherwise derive it from the current range.
  const selectedPreset = preset != null && preset !== DatePreset.Custom
    ? preset
    : presetForDateRange(dateRange, preset ?? lastPreset, activationDate)

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

  const options = allOptions.filter(o => o.value !== DatePreset.Custom)
  const selectedOption = allOptions.find(o => o.value === (selectedPreset ?? DatePreset.Custom)) ?? null

  const resolveRange = useCallback((nextPreset: Exclude<DatePreset, DatePreset.Custom>): DateRange | null => {
    if (nextPreset === DatePreset.AllTime) {
      // Business is loaded by the time the user can interact, but guard anyway.
      return activationDate ? rangeForAllTime(activationDate) : null
    }
    return rangeForPreset(nextPreset)
  }, [activationDate])

  const onSelectedValueChange = useCallback((option: DateSelectionOption | null) => {
    if (option === null) return

    const nextPreset = option.value
    if (nextPreset === DatePreset.Custom) return

    const nextRange = resolveRange(nextPreset)
    if (nextRange === null) return

    setLastPreset(nextPreset)

    if (setPresetRange) {
      setPresetRange({ preset: nextPreset, startDate: nextRange.startDate, endDate: nextRange.endDate })
    }
    else {
      setDateRange(nextRange)
    }
  }, [resolveRange, setPresetRange, setDateRange])

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

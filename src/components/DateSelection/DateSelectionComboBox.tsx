import { useCallback, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getActivationDate } from '@utils/business'
import { type DateRange } from '@providers/DateStoreProvider/internal/types'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { DatePreset, presetForDateRange, rangeForPreset } from '@components/DateSelection/utils'

type DateSelectionOption = {
  label: string
  value: DatePreset
}

type DateSelectionComboBoxProps = {
  startDate: Date
  endDate: Date
  setDateRange: (range: DateRange) => void
  showLabel?: boolean
}

export const DateSelectionComboBox = ({ startDate, endDate, setDateRange, showLabel = false }: DateSelectionComboBoxProps) => {
  const { t } = useTranslation()
  const [lastPreset, setLastPreset] = useState<DatePreset | null>(null)
  const { business } = useLayerContext()

  const dateRange = useMemo(() => ({ startDate, endDate }), [startDate, endDate])

  const activationDate = getActivationDate(business)

  const selectedPreset = presetForDateRange(dateRange, lastPreset, activationDate)

  const allOptions = useMemo<DateSelectionOption[]>(
    () => [
      { value: DatePreset.ThisMonth, label: t('date:label.this_month', 'This Month') },
      { value: DatePreset.LastMonth, label: t('date:label.last_month', 'Last Month') },
      { value: DatePreset.ThisQuarter, label: t('date:label.this_quarter', 'This Quarter') },
      { value: DatePreset.LastQuarter, label: t('date:label.last_quarter', 'Last Quarter') },
      { value: DatePreset.ThisYear, label: t('date:label.this_year', 'This Year') },
      { value: DatePreset.LastYear, label: t('date:label.last_year', 'Last Year') },
      { value: DatePreset.AllTime, label: t('date:label.all_time', 'All time') },
      { value: DatePreset.Custom, label: t('date:label.custom', 'Custom') },
    ],
    [t],
  )

  const options = allOptions.filter(o => o.value !== DatePreset.Custom)
  const selectedOption = allOptions.find(o => o.value === (selectedPreset ?? DatePreset.Custom)) ?? null

  const onSelectedValueChange = useCallback((option: DateSelectionOption | null) => {
    if (option === null) return

    if (option.value === DatePreset.Custom) return

    const nextPreset = option.value
    setLastPreset(nextPreset)

    const nextRange = rangeForPreset(nextPreset, { activationDate })
    setDateRange(nextRange)
  }, [setDateRange, activationDate])

  const inputId = useId()

  const label = t('date:label.time_period', 'Time period')
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

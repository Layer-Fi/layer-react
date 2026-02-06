import { useCallback, useId, useState } from 'react'

import { getActivationDate } from '@utils/business'
import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { DatePreset, presetForDateRange, rangeForPreset } from '@components/DateSelection/utils'

type DateSelectionOption = {
  label: string
  value: DatePreset
}
const dateSelectionOptionConfig = {
  [DatePreset.ThisMonth]: { label: 'This Month', value: DatePreset.ThisMonth },
  [DatePreset.LastMonth]: { label: 'Last Month', value: DatePreset.LastMonth },
  [DatePreset.ThisQuarter]: { label: 'This Quarter', value: DatePreset.ThisQuarter },
  [DatePreset.LastQuarter]: { label: 'Last Quarter', value: DatePreset.LastQuarter },
  [DatePreset.ThisYear]: { label: 'This Year', value: DatePreset.ThisYear },
  [DatePreset.LastYear]: { label: 'Last Year', value: DatePreset.LastYear },
  [DatePreset.Custom]: { label: 'Custom', value: DatePreset.Custom },
}
const options = Object.values(dateSelectionOptionConfig).filter(opt => opt.value !== DatePreset.Custom)

export const DateSelectionComboBox = () => {
  const [lastPreset, setLastPreset] = useState<DatePreset | null>(null)
  const { business } = useLayerContext()

  const dateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()

  const selectedPreset = presetForDateRange(dateRange, lastPreset, getActivationDate(business))
  const selectedOption = dateSelectionOptionConfig[selectedPreset ?? DatePreset.Custom]

  const onSelectedValueChange = useCallback((option: DateSelectionOption | null) => {
    if (option === null) return

    if (option.value === DatePreset.Custom) return

    const nextPreset = option.value
    setLastPreset(nextPreset)

    const nextRange = rangeForPreset(nextPreset)
    setDateRange(nextRange)
  }, [setDateRange])

  const inputId = useId()

  return (
    <VStack>
      <Label pbe='3xs' size='sm' htmlFor={inputId}>Report period</Label>
      <ComboBox
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

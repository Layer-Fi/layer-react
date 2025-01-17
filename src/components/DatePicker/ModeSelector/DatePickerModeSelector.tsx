
import { Toggle } from '../../Toggle'
import { ToggleSize } from '../../Toggle/Toggle'
import type { DatePickerMode, DateRangePickerMode } from '../../../providers/GlobalDateStore/GlobalDateStoreProvider'

export type UnifiedPickerMode = DatePickerMode | DateRangePickerMode

export const DEFAULT_ALLOWED_PICKER_MODES = ['monthPicker'] as const

const UNIFIED_PICKER_MODE_CONFIG: Record<UnifiedPickerMode, { label: string }> = {
  dayPicker: { label: 'Day' },
  dayRangePicker: { label: 'Select dates' },
  monthPicker: { label: 'Month' },
  monthRangePicker: { label: 'Select months' },
  yearPicker: { label: 'Year' },
}

function toToggleOptions(allowedModes: ReadonlyArray<UnifiedPickerMode>) {
  return allowedModes.map(mode => ({
    label: UNIFIED_PICKER_MODE_CONFIG[mode].label,
    value: mode,
  }))
}

export type DatePickerModeSelectorProps = {
  mode: UnifiedPickerMode
  allowedModes: ReadonlyArray<UnifiedPickerMode>
  onChangeMode: (mode: UnifiedPickerMode) => void
}

export function DatePickerModeSelector({
  mode,
  allowedModes,
  onChangeMode,
}: DatePickerModeSelectorProps) {
  if (allowedModes.length <= 1) {
    return null
  }

  return (
    <div className='Layer__DatePickerModeSelector__container'>
      <Toggle
        name='date-pick-mode-selector'
        size={ToggleSize.xsmall}
        selected={mode}
        options={toToggleOptions(allowedModes)}
        onChange={({ target: { value } }) => {
          const mode = value as UnifiedPickerMode
          if (allowedModes.includes(mode)) {
            onChangeMode?.(mode)
          }
        }}
      />
    </div>
  )
}

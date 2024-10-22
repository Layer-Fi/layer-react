import React from 'react'
import { Toggle } from '../../Toggle'
import { ToggleSize } from '../../Toggle/Toggle'

export type SingularPickerMode = 'dayPicker' | 'timePicker'
export type RangePickerMode =
  | 'dayRangePicker'
  | 'monthRangePicker'
  | 'monthPicker'

export type DatePickerMode = SingularPickerMode | RangePickerMode

export const DEFAULT_ALLOWED_PICKER_MODES = ['monthPicker'] as const

const DATE_RANGE_MODE_CONFIG: Record<DatePickerMode, { label: string }> = {
  timePicker: { label: 'Time' },
  dayPicker: { label: 'Day' },
  dayRangePicker: { label: 'Select dates' },
  monthPicker: { label: 'Month' },
  monthRangePicker: { label: 'Select months' },
}

function toToggleOptions(allowedModes: ReadonlyArray<DatePickerMode>) {
  return allowedModes.map(mode => ({
    label: DATE_RANGE_MODE_CONFIG[mode].label,
    value: mode,
  }))
}

export type DatePickerModeSelectorProps = {
  mode: DatePickerMode
  allowedModes: ReadonlyArray<DatePickerMode>
  onChangeMode: (mode: DatePickerMode) => void
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
          const mode = value as DatePickerMode
          if (allowedModes.includes(mode)) {
            onChangeMode?.(mode)
          }
        }}
      />
    </div>
  )
}

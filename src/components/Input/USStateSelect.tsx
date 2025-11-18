import { Select } from '@components/Input/Select'
import { BaseSelectOption } from '@internal-types/general'
import { US_STATES, USState } from '@internal-types/location'

export const findSelectOption = (options: BaseSelectOption[], selected?: string) => {
  if (!selected) {
    return undefined
  }

  return options.find(o =>
    String(o.value).toLowerCase() === String(selected).toLowerCase()
    || String(o.label).toLowerCase() === String(selected).toLowerCase(),
  )
}

export type USStateSelecttProps = {
  value?: string
  onChange: (value: USState) => void
}

export const USStateSelect = ({ value, onChange }: USStateSelecttProps) => {
  const usStateOptions: BaseSelectOption[] = US_STATES.map(state => ({
    label: state.label,
    value: state.value,
  }))

  return (
    <Select
      options={usStateOptions}
      value={findSelectOption(usStateOptions, value)}
      onChange={option => onChange(option as USState)}
      placeholder='US state'
    />
  )
}

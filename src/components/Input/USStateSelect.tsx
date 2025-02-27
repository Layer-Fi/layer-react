import { BaseSelectOption } from '../../types/general'
import { US_STATES, USState } from '../../types/location'
import { humanizeEnum } from '../../utils/format'
import { Select } from './Select'

export const findSelectOption = (options: BaseSelectOption[], value?: USState) => {
  if (!value) {
    return undefined
  }

  return options.find(o => o.value === value)
}

export type USStateSelecttProps = {
  value?: USState
  onChange: (value: USState) => void
}

export const USStateSelect = ({ value, onChange }: USStateSelecttProps) => {
  const usStateOptions: BaseSelectOption[] = US_STATES.map(state => ({
    label: humanizeEnum(state),
    value: state,
  }))

  return (
    <Select
      options={usStateOptions}
      value={findSelectOption(usStateOptions, value)}
      onChange={option => onChange(option?.value as USState)}
      placeholder='US state'
    />
  )
}

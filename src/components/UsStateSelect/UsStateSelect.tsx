import { BaseSelectOption } from '../../types/general'
import { US_STATES } from '../../types/location'
import { Select } from '../Input/Select'

export const findSelectOption = (options: BaseSelectOption[], value?: string) => {
  if (!value) {
    return undefined
  }

  return options.find(o => (o.value as string).toLowerCase() === value.toLowerCase())
}

export type UsStateSelecttProps = {
  value?: string // @TODO - use type from Entity_Types
  onChange: (value: string) => void
}

export const UsStateSelect = ({ value, onChange }: UsStateSelecttProps) => {
  const usStateOptions: BaseSelectOption[] = US_STATES.map(state => ({
    label: state,
    value: state,
  }))

  return (
    <Select
      options={usStateOptions}
      value={findSelectOption(usStateOptions, value)}
      onChange={option => onChange(option?.value as string)}
    />
  )
}

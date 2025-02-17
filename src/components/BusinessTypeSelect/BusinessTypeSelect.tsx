import { ENTITY_TYPES } from '../../types/business'
import { BaseSelectOption } from '../../types/general'
import { Select } from '../Input/Select'

export const findSelectOption = (options: BaseSelectOption[], value?: string) => {
  if (!value) {
    return undefined
  }

  return options.find(o => (o.value as string).toLowerCase() === value.toLowerCase())
}

export type BusinessTypeSelectProps = {
  value?: string // @TODO - use type from Entity_Types
  onChange: (value: string) => void
}

export const BusinessTypeSelect = ({ value, onChange }: BusinessTypeSelectProps) => {
  const entityTypeOptions: BaseSelectOption[] = ENTITY_TYPES.map(state => ({
    label: state,
    value: state,
  }))

  return (
    <Select
      options={entityTypeOptions}
      value={findSelectOption(entityTypeOptions, value)}
      onChange={option => onChange(option?.value as string)}
    />
  )
}

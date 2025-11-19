import { ENTITY_TYPES, type EntityType } from '@internal-types/business'
import { Select } from '@components/Input/Select'

export const findSelectOption = (options: typeof ENTITY_TYPES, value?: EntityType) => {
  if (!value) {
    return undefined
  }

  return options.find(o => o.value === value)
}

export type BusinessTypeSelectProps = {
  value?: EntityType
  onChange: (value: EntityType) => void
}

export const BusinessTypeSelect = ({ value, onChange }: BusinessTypeSelectProps) => {
  const entityTypeOptions = ENTITY_TYPES

  return (
    <Select
      options={entityTypeOptions}
      value={findSelectOption(entityTypeOptions, value)}
      onChange={option => onChange(option?.value)}
    />
  )
}

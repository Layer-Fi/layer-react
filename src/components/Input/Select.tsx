import React from 'react'
import ReactSelect, {
  DropdownIndicatorProps,
  GroupBase,
  OptionsOrGroups,
  components,
} from 'react-select'
import ChevronDownFill from '../../icons/ChevronDownFill'

export interface SelectProps<T> {
  name?: string
  options?: OptionsOrGroups<T, GroupBase<T>>
  className?: string
  classNamePrefix?: string
  value?: T
  onChange: (selected: T) => void
  disabled?: boolean
  placeholder?: string
}

const DropdownIndicator:
  | React.ComponentType<DropdownIndicatorProps<any, false, GroupBase<any>>>
  | null
  | undefined = props => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownFill />
    </components.DropdownIndicator>
  )
}

export const Select = <T,>({
  name,
  options,
  className,
  classNamePrefix = 'Layer__select',
  value,
  onChange,
  disabled,
  placeholder,
}: SelectProps<T>) => {
  return (
    <ReactSelect<T>
      name={name}
      className={`Layer__select ${className ?? ''}`}
      classNamePrefix={classNamePrefix}
      placeholder={placeholder ?? 'Select...'}
      options={options}
      value={value}
      onChange={newValue => newValue && onChange(newValue)}
      menuPortalTarget={document.body}
      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
      components={{ DropdownIndicator }}
      isDisabled={disabled}
    />
  )
}

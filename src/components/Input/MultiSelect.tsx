import React from 'react'
import ReactSelect, {
  DropdownIndicatorProps,
  GroupBase,
  MultiValue,
  OptionsOrGroups,
  components,
} from 'react-select'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'
import classNames from 'classnames'

export interface SelectProps<T> {
  name?: string
  options?: OptionsOrGroups<T, GroupBase<T>>
  className?: string
  classNamePrefix?: string
  value?: T[]
  defaultValue?: T[]
  onChange: (selected: MultiValue<T>) => void
  disabled?: boolean
  placeholder?: string
  isInvalid?: boolean
  errorMessage?: string
}

const DropdownIndicator:
  | React.ComponentType<DropdownIndicatorProps<any, true, GroupBase<any>>>
  | null
  | undefined = props => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownFill />
    </components.DropdownIndicator>
  )
}

export const MultiSelect = <T,>({
  name,
  options,
  className,
  classNamePrefix = 'Layer__select',
  value,
  defaultValue,
  onChange,
  disabled,
  placeholder,
  isInvalid,
  errorMessage,
}: SelectProps<T>) => {
  const baseClassName = classNames(
    'Layer__select',
    isInvalid ? 'Layer__select--error' : '',
    className,
  )
  return (
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <ReactSelect<T, true>
          name={name}
          className={baseClassName}
          classNamePrefix={classNamePrefix}
          placeholder={placeholder ?? 'Select...'}
          options={options}
          value={value}
          defaultValue={defaultValue}
          onChange={newValue => newValue && onChange(newValue)}
          menuPortalTarget={document.body}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          components={{ DropdownIndicator }}
          isDisabled={disabled}
          isMulti={true}
        />
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}

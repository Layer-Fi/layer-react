import { useCallback } from 'react'
import ReactSelect, {
  DropdownIndicatorProps,
  GroupBase,
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
  value?: T
  onChange: (selected: T) => void
  disabled?: boolean
  placeholder?: string
  isInvalid?: boolean
  errorMessage?: string
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
  isInvalid,
  errorMessage,
}: SelectProps<T>) => {
  const baseClassName = classNames(
    'Layer__select',
    isInvalid ? 'Layer__select--error' : '',
    className,
  )

  const DropdownIndicator = useCallback((props: DropdownIndicatorProps<T, false>) => (
    <components.DropdownIndicator {...props}>
      <ChevronDownFill />
    </components.DropdownIndicator>
  ), [])

  return (
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <ReactSelect<T>
          name={name}
          className={baseClassName}
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
      </TooltipTrigger>
      <TooltipContent>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}

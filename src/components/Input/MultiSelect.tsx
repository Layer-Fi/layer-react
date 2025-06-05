import { useCallback } from 'react'
import ReactSelect, {
  DropdownIndicatorProps,
  GroupBase,
  MultiValue,
  OptionsOrGroups,
  StylesConfig,
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
  styles?: StylesConfig<T, true, GroupBase<T>>
  inputId?: string
  isLoading?: boolean
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
  styles,
  inputId,
  isLoading,
}: SelectProps<T>) => {
  const baseClassName = classNames(
    'Layer__select',
    isInvalid ? 'Layer__select--error' : '',
    className,
  )

  const DropdownIndicator = useCallback((props: DropdownIndicatorProps<T, true>) => (
    <components.DropdownIndicator {...props}>
      <ChevronDownFill />
    </components.DropdownIndicator>
  ), [])

  return (
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <ReactSelect<T, true>
          inputId={inputId}
          name={name}
          className={baseClassName}
          classNamePrefix={classNamePrefix}
          placeholder={placeholder ?? 'Select...'}
          options={options}
          value={value}
          defaultValue={defaultValue}
          onChange={newValue => newValue && onChange(newValue)}
          menuPortalTarget={document.body}
          styles={{
            menuPortal: base => ({ ...base, zIndex: 9999 }),
            ...styles,
          }}
          components={{ DropdownIndicator }}
          isLoading={isLoading}
          isDisabled={disabled}
          isMulti={true}
        />
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}

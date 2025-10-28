import { type ReactNode, useCallback } from 'react'
import ReactSelect, {
  DropdownIndicatorProps,
  FormatOptionLabelMeta,
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
  inputId?: string
  isLoading?: boolean
  formatOptionLabel?: (option: T, meta?: FormatOptionLabelMeta<T>) => ReactNode
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
  inputId,
  isLoading,
  formatOptionLabel,
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
      <TooltipTrigger>
        <ReactSelect<T>
          inputId={inputId}
          name={name}
          className={baseClassName}
          classNamePrefix={classNamePrefix}
          placeholder={placeholder ?? 'Select...'}
          options={options}
          formatOptionLabel={formatOptionLabel}
          value={value}
          onChange={newValue => newValue && onChange(newValue)}
          menuPortalTarget={document.body}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          components={{ DropdownIndicator }}
          isLoading={isLoading}
          isDisabled={disabled}
        />
      </TooltipTrigger>
      <TooltipContent>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}

import { type ReactNode, useCallback } from 'react'
import classNames from 'classnames'
import ReactSelect, {
  components,
  type DropdownIndicatorProps,
  type FormatOptionLabelMeta,
  type GroupBase,
  type OptionsOrGroups,
} from 'react-select'

import ChevronDownFill from '@icons/ChevronDownFill'
import { SelectMenuPortal } from '@components/Input/SelectMenuPortal'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

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
    <DeprecatedTooltip disabled={!isInvalid || !errorMessage}>
      <DeprecatedTooltipTrigger className='Layer__input-tooltip'>
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
          components={{ DropdownIndicator, MenuPortal: SelectMenuPortal }}
          isLoading={isLoading}
          isDisabled={disabled}
        />
      </DeprecatedTooltipTrigger>
      <DeprecatedTooltipContent className='Layer__tooltip'>{errorMessage}</DeprecatedTooltipContent>
    </DeprecatedTooltip>
  )
}

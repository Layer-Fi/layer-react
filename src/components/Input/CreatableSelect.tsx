import { type ReactNode, useCallback } from 'react'
import classNames from 'classnames'
import {
  components,
  type DropdownIndicatorProps,
  type GroupBase,
} from 'react-select'
import BaseCreatableSelect, { type CreatableProps } from 'react-select/creatable'

import ChevronDownFill from '@icons/ChevronDownFill'
import { type SelectProps } from '@components/Input/Select'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

export interface CreatableSelectProps<T> extends Omit<SelectProps<T>, 'value' | 'onChange'> {
  value?: T | null
  onChange: (selected: T | null) => void
  isClearable?: boolean
  onCreateOption?: (inputValue: string) => void
  isValidNewOption?: CreatableProps<T, false, GroupBase<T>>['isValidNewOption']
  formatCreateLabel?: (inputValue: string) => ReactNode
  createOptionPosition?: 'first' | 'last'
}

export const CreatableSelect = <T,>({
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
  formatOptionLabel,
  onCreateOption,
  isValidNewOption,
  formatCreateLabel,
  inputId,
  isLoading,
  isClearable,
  createOptionPosition = 'first',
}: CreatableSelectProps<T>) => {
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
        <BaseCreatableSelect<T>
          inputId={inputId}
          name={name}
          className={baseClassName}
          classNamePrefix={classNamePrefix}
          placeholder={placeholder ?? 'Select...'}
          options={options}
          formatOptionLabel={formatOptionLabel}
          value={value}
          onChange={newValue => onChange(newValue)}
          onCreateOption={onCreateOption}
          isValidNewOption={isValidNewOption}
          formatCreateLabel={formatCreateLabel}
          menuPortalTarget={document.body}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          components={{ DropdownIndicator }}
          isLoading={isLoading}
          isDisabled={disabled}
          isClearable={isClearable}
          escapeClearsValue={isClearable}
          createOptionPosition={createOptionPosition}
        />
      </DeprecatedTooltipTrigger>
      <DeprecatedTooltipContent className='Layer__tooltip'>{errorMessage}</DeprecatedTooltipContent>
    </DeprecatedTooltip>
  )
}

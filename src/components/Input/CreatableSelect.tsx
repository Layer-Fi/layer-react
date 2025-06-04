import { ReactNode, useCallback } from 'react'
import {
  DropdownIndicatorProps,
  GroupBase,
  components,
} from 'react-select'
import BaseCreatableSelect, { type CreatableProps } from 'react-select/creatable'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'
import classNames from 'classnames'
import { type SelectProps } from './Select'

export interface CreatableSelectProps<T> extends Omit<SelectProps<T>, 'value' | 'onChange'> {
  value?: T | null
  onChange: (selected: T | null) => void
  isClearable?: boolean
  onCreateOption?: (inputValue: string) => void
  isValidNewOption?: CreatableProps<T, false, GroupBase<T>>['isValidNewOption']
  formatCreateLabel?: (inputValue: string) => ReactNode
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
  onCreateOption,
  isValidNewOption,
  formatCreateLabel,
  inputId,
  isLoading,
  isClearable,
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
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <BaseCreatableSelect<T>
          inputId={inputId}
          name={name}
          className={baseClassName}
          classNamePrefix={classNamePrefix}
          placeholder={placeholder ?? 'Select...'}
          options={options}
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
        />
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}

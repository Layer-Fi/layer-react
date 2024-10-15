import React, { useEffect, useState } from 'react'
import ReactSelect, {
  DropdownIndicatorProps,
  GroupBase,
  MultiValue,
  MultiValueProps,
  OptionsOrGroups,
  StylesConfig,
  components,
} from 'react-select'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'
import classNames from 'classnames'

export interface SelectProps<T extends { value: any }> {
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
  clearOption?: boolean
  clearLabel?: string
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

const MoreSelectedBadge = ({ label }: { label: string }) => {
  return <div className='Layer__select__multi-value-hidden'>{label}</div>
}

const getVisibleItems = (items: any[], containerWidth: number) => {
  const itemWidths = items.map(item => item.label.length * 8 + 9 + 22) // Width calculation

  let totalWidth = 0
  let visibleCount = 0
  for (let i = 0; i < itemWidths.length; i++) {
    totalWidth += itemWidths[i]
    if (totalWidth > containerWidth) break
    visibleCount++
  }

  const hiddenCount = items.length - visibleCount

  return { visibleCount, hiddenCount }
}

type MultiValuePropsWithoutNull = Exclude<
  MultiValueProps<unknown, boolean, GroupBase<unknown>>,
  null | undefined
>

const CustomValueContainer: React.FC<{
  index: number
  getValue: () => any
  [key: string]: any
}> = ({ index, getValue, ...props }) => {
  const items = getValue()

  const container = document.querySelector(
    '.Layer__multiselect-input .Layer__select__value-container',
  )
  let containerWidth = 100
  if (container) {
    containerWidth = container.clientWidth
  }

  console.log('containerWidth', containerWidth, container?.clientWidth)

  const { visibleCount, hiddenCount } = getVisibleItems(
    items,
    containerWidth + 16,
  ) // Use dynamic width

  if (index < visibleCount) {
    return <components.MultiValue {...(props as MultiValuePropsWithoutNull)} />
  }

  if (index === visibleCount && hiddenCount > 0) {
    return <MoreSelectedBadge label={`+${hiddenCount}`} />
  }

  return null
}

export const MultiSelect = <T extends { value: any }>({
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
  clearOption = false,
  clearLabel = 'Clear',
}: SelectProps<T>) => {
  const baseClassName = classNames(
    'Layer__select',
    isInvalid ? 'Layer__select--error' : '',
    className,
  )

  const modifiedOptions = clearOption
    ? [
        ...(options || []),
        { label: clearLabel, value: null } as unknown as T, // Cast to T to satisfy type
      ]
    : options || [] // Ensure options is always an array

  return (
    <div className='Layer__multiselect-input'>
      <Tooltip disabled={!isInvalid || !errorMessage}>
        <TooltipTrigger className='Layer__input-tooltip'>
          <ReactSelect
            name={name}
            className={baseClassName}
            classNamePrefix={classNamePrefix}
            placeholder={placeholder ?? 'Select...'}
            options={modifiedOptions} // Use modified options
            value={value}
            defaultValue={defaultValue}
            onChange={newValue => {
              // Handle clear option
              if (
                newValue.some(
                  option => (option as { value: any }).value === null,
                )
              ) {
                // Cast option to include value
                onChange([]) // Clear selection
              } else {
                onChange(newValue)
              }
            }}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: base => ({ ...base, zIndex: 9999 }),
              ...styles,
            }}
            components={{
              DropdownIndicator,
              MultiValue: CustomValueContainer,
            }}
            isDisabled={disabled}
            isMulti={true}
          />
        </TooltipTrigger>
        <TooltipContent className='Layer__tooltip'>
          {errorMessage}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

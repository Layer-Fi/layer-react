import { type ReactNode } from 'react'

import { CreatableComboBox } from '@ui/ComboBox/CreatableComboBox'
import { SearchComboBox } from '@ui/ComboBox/SearchComboBox'
import { type ComboBoxOption } from '@ui/ComboBox/types'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'
import { FieldErrors } from '@blocks/Form/FieldErrors'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import { useFieldContext } from './formContexts'

/** `isCreated` marks text the user typed rather than a result they picked. */
export type SearchComboBoxSelection = { value: string, label: string, isCreated?: boolean }

export type FormSearchComboBoxFieldProps = Pick<CommonFormFieldProps, 'label' | 'className' | 'inline' | 'showLabel' | 'isDisabled' | 'showFieldError'> & {
  options: ReadonlyArray<ComboBoxOption>
  isLoading?: boolean
  onSearchQueryChange: (query: string) => void
  placeholder?: string
  allowCreate?: boolean
  formatCreateLabel?: (text: string) => ReactNode
  onSelect?: (selection: SearchComboBoxSelection) => void
}

export function FormSearchComboBoxField({
  options,
  isLoading = false,
  onSearchQueryChange,
  placeholder,
  allowCreate = false,
  formatCreateLabel,
  onSelect,
  isDisabled,
  showFieldError = true,
  ...props
}: FormSearchComboBoxFieldProps) {
  const field = useFieldContext<SearchComboBoxSelection | null>()
  const { value, meta } = field.state

  const select = (selection: SearchComboBoxSelection) => {
    field.handleChange(selection)
    onSelect?.(selection)
  }

  const onSelectedValueChange = (option: ComboBoxOption | null) => {
    if (option) select({ value: option.value, label: option.label })
  }

  const selectedValue = value ? { value: value.value, label: value.label } : null

  const isValidNewOption = (text: string) => {
    const typed = text.trim().toLocaleLowerCase()
    return !isLoading && typed.length > 0 && !options.some(({ label }) => label.trim().toLocaleLowerCase() === typed)
  }

  return (
    <>
      <ComboBoxField {...props}>
        {controlProps => (allowCreate
          ? (
            <CreatableComboBox
              {...controlProps}
              placeholder={placeholder}
              options={options}
              selectedValue={selectedValue}
              onSelectedValueChange={onSelectedValueChange}
              isClearable={false}
              isDisabled={isDisabled}
              isError={!meta.isValid}
              isLoading={isLoading}
              filterOption={null}
              onInputValueChange={onSearchQueryChange}
              onCreateOption={text => select({ value: text, label: text, isCreated: true })}
              isValidNewOption={isValidNewOption}
              formatCreateLabel={formatCreateLabel}
              createOptionPosition='last'
            />
          )
          : (
            <SearchComboBox
              {...controlProps}
              placeholder={placeholder}
              options={options}
              selectedValue={selectedValue}
              onSelectedValueChange={onSelectedValueChange}
              isClearable={false}
              isDisabled={isDisabled}
              isError={!meta.isValid}
              isLoading={isLoading}
              onSearchQueryChange={onSearchQueryChange}
            />
          ))}
      </ComboBoxField>
      {showFieldError ? <FieldErrors errors={meta.errors} /> : null}
    </>
  )
}

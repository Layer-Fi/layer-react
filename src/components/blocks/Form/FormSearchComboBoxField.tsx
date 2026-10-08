import { type ReactNode } from 'react'

import { MaybeCreatableComboBox } from '@ui/ComboBox/MaybeCreatableComboBox'
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
  /** The search request failed; `searchErrorMessage` shows in the dropdown. */
  isSearchError?: boolean
  searchErrorMessage?: string
  onSelect?: (selection: SearchComboBoxSelection) => void
}

export function FormSearchComboBoxField({
  options,
  isLoading = false,
  onSearchQueryChange,
  placeholder,
  allowCreate = false,
  formatCreateLabel,
  isSearchError = false,
  searchErrorMessage,
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

  const isValidNewOption = (text: string) => {
    const typed = text.trim().toLocaleLowerCase()
    return !isLoading && typed.length > 0 && !options.some(({ label }) => label.trim().toLocaleLowerCase() === typed)
  }

  const creatableProps = allowCreate
    ? {
      isCreatable: true as const,
      onCreateOption: (text: string) => select({ value: text, label: text, isCreated: true }),
      isValidNewOption,
      formatCreateLabel,
      createOptionPosition: 'last' as const,
    }
    : { isCreatable: false as const }

  return (
    <>
      <ComboBoxField {...props}>
        {controlProps => (
          <MaybeCreatableComboBox
            {...controlProps}
            {...creatableProps}
            placeholder={placeholder}
            options={options}
            selectedValue={value ? { value: value.value, label: value.label } : null}
            onSelectedValueChange={(option) => {
              if (option) select({ value: option.value, label: option.label })
            }}
            onInputValueChange={onSearchQueryChange}
            // Results come from the server, so the default label filter would hide matches on other fields.
            filterOption={null}
            isClearable={false}
            isDisabled={isDisabled}
            isInvalid={!meta.isValid}
            isError={isSearchError}
            isLoading={isLoading}
            slots={searchErrorMessage ? { ErrorMessage: searchErrorMessage } : undefined}
          />
        )}
      </ComboBoxField>
      {showFieldError ? <FieldErrors errors={meta.errors} /> : null}
    </>
  )
}

import React from 'react'
import Select from 'react-select'
import { useLayerContext } from '../../hooks/useLayerContext'
import { BankTransaction, CategorizationType, Category } from '../../types'

type Props = {
  name?: string
  bankTransaction: BankTransaction
  value: Category | undefined
  onChange: (newValue: Category) => void
  disabled?: boolean
  className?: string
}

export const CategoryMenu = ({
  bankTransaction,
  name,
  value,
  onChange,
  disabled,
  className,
}: Props) => {
  const { categories } = useLayerContext()

  const suggestedOptions =
    bankTransaction?.categorization_flow?.type ===
    CategorizationType.ASK_FROM_SUGGESTIONS
      ? [
          {
            label: 'Suggested',
            options: bankTransaction.categorization_flow.suggestions,
          },
        ]
      : []

  const categoryOptions = (categories || [])
    .map(category => {
      if (category?.subCategories && category?.subCategories?.length > 0) {
        return {
          label: category.display_name,
          options: category.subCategories,
        }
      }
      return {
        label: category.display_name,
        options: [category],
      }
    })
    .filter(x => x)

  const options = [...suggestedOptions, ...categoryOptions]

  // The menu does not show in all cases unless the
  // menuPortalTarget and styles lines exist
  // See: https://stackoverflow.com/questions/55830799/how-to-change-zindex-in-react-select-drowpdown
  return (
    <Select<Category>
      name={name}
      className={`Layer__category-menu Layer__select ${className ?? ''}`}
      classNamePrefix='Layer__select'
      options={options}
      isSearchable={true}
      value={value}
      onChange={newValue => newValue && onChange(newValue)}
      getOptionLabel={category => category.display_name}
      getOptionValue={category => category.stable_name || category.category}
      menuPortalTarget={document.body}
      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
      isDisabled={disabled}
    />
  )
}

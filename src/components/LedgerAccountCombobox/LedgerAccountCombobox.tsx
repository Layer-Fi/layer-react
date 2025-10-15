import { useCallback, useId, useMemo } from 'react'
import { ComboBox } from '../ui/ComboBox/ComboBox'
import { VStack } from '../ui/Stack/Stack'
import { Label } from '../ui/Typography/Text'
import { getLeafCategories, CategoryAsOption, findCategoryInOptions } from '../../types/categories'
import { type CategoriesListMode } from '../../schemas/categorization'
import { useCategories } from '../../hooks/categories/useCategories'
import { type AccountIdentifier } from '../../schemas/accountIdentifier'

type LedgerAccountComboboxProps = {
  label: string
  value: AccountIdentifier | null
  onValueChange: (value: AccountIdentifier | null) => void
  mode?: CategoriesListMode
  isReadOnly?: boolean
  showLabel?: boolean
  className?: string
}

export const LedgerAccountCombobox = ({ label, value, mode, onValueChange, isReadOnly, showLabel, className }: LedgerAccountComboboxProps) => {
  const { data: categories, isLoading } = useCategories({ mode })

  const options = useMemo(() => {
    if (!categories) return []
    return getLeafCategories(categories).map(category => new CategoryAsOption(category))
  }, [categories])

  const selectedCategory = useMemo(() => {
    if (!value) return null
    return findCategoryInOptions(value, options) ?? null
  }, [options, value])

  const onSelectedValueChange = useCallback((option: CategoryAsOption | null) => {
    onValueChange(option?.accountIdentifier ?? null)
  }, [onValueChange])

  const inputId = useId()
  const additionalAriaProps = !showLabel && { 'aria-label': label }
  return (
    <VStack gap='3xs' className={className}>
      {showLabel && (
        <Label size='sm' htmlFor={inputId}>
          {label}
        </Label>
      )}
      <ComboBox
        options={options}
        onSelectedValueChange={onSelectedValueChange}
        selectedValue={selectedCategory}
        inputId={inputId}
        isReadOnly={isReadOnly}
        isLoading={isLoading}
        isClearable={false}
        {...additionalAriaProps}
      />
    </VStack>
  )
}

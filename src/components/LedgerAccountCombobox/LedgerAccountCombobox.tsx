import { useCallback, useId, useMemo } from 'react'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { getLeafCategories } from '@internal-types/categories'
import { ClassificationEquivalence, type CategoriesListMode, type Classification } from '@schemas/categorization'
import { useCategories } from '@hooks/categories/useCategories'
import { CategoryAsOption } from '@internal-types/categorizationOption'

type LedgerAccountComboboxProps = {
  label: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
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
    return options.find(option => ClassificationEquivalence(value, option.classification)) ?? null
  }, [options, value])

  const onSelectedValueChange = useCallback((option: CategoryAsOption | null) => {
    onValueChange(option?.classification ?? null)
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

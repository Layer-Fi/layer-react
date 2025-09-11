import { useCallback, useId, useMemo } from 'react'
import { ComboBox } from '../ui/ComboBox/ComboBox'
import { VStack } from '../ui/Stack/Stack'
import { Label } from '../ui/Typography/Text'
import { isOptionalAccountNestedCategory, type CategoriesListMode, type Category } from '../../types/categories'
import { useCategories } from '../../hooks/categories/useCategories'
import { AccountIdentifierEquivalence, makeAccountId, makeStableName, type AccountIdentifier } from '../../schemas/accountIdentifier'

class CategoryAsOption {
  private internalCategory: Category

  constructor(category: Category) {
    this.internalCategory = category
  }

  get label() {
    return this.internalCategory.display_name
  }

  get accountIdentifier() {
    if (isOptionalAccountNestedCategory(this.internalCategory)) return makeStableName(this.internalCategory.stable_name)
    return makeAccountId(this.internalCategory.id)
  }

  get value() {
    if (isOptionalAccountNestedCategory(this.internalCategory)) return this.internalCategory.stable_name
    return this.internalCategory.id
  }
}

const getLeafCategories = (categories: Category[]): Category[] => {
  return categories.flatMap((category) => {
    if (!category.subCategories || category.subCategories.length === 0) {
      return [category]
    }
    return getLeafCategories(category.subCategories)
  })
}

type LedgerAccountComboboxProps = {
  label: string
  value: AccountIdentifier | null
  onValueChange: (value: AccountIdentifier | null) => void
  mode?: CategoriesListMode
  isReadOnly?: boolean
  showLabel?: boolean
}

export const LedgerAccountCombobox = ({ label, value, mode, onValueChange, isReadOnly, showLabel }: LedgerAccountComboboxProps) => {
  const { data: categories, isLoading } = useCategories({ mode })

  const options = useMemo(() => {
    if (!categories) return []
    return getLeafCategories(categories).map(category => new CategoryAsOption(category))
  }, [categories])

  const selectedCategory = useMemo(() => {
    if (!value) return null
    return options.find(option => AccountIdentifierEquivalence(value, option.accountIdentifier)) ?? null
  }, [options, value])

  const onSelectedValueChange = useCallback((option: CategoryAsOption | null) => {
    onValueChange(option?.accountIdentifier ?? null)
  }, [onValueChange])

  const inputId = useId()
  const additionalAriaProps = !showLabel && { 'aria-label': label }
  return (
    <VStack gap='3xs'>
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

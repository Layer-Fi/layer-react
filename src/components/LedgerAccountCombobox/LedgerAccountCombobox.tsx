import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'

import { CategoryAsOption } from '@internal-types/categorizationOption'
import { type CategoriesListMode, type Classification, ClassificationEquivalence } from '@schemas/categorization'
import { getLeafCategories } from '@utils/categories'
import { useCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { Label } from '@ui/Typography/Text'

import './ledgerAccountCombobox.scss'

type LedgerAccountComboboxProps = {
  label: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
  mode?: CategoriesListMode
  placeholder?: string
  isReadOnly?: boolean
  isInvalid?: boolean
  showLabel?: boolean
  inline?: boolean
  className?: string
}

export const LedgerAccountCombobox = ({
  label,
  value,
  mode,
  onValueChange,
  placeholder,
  isReadOnly,
  isInvalid,
  showLabel,
  inline,
  className,
}: LedgerAccountComboboxProps) => {
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
    <div className={classNames('Layer__LedgerAccountCombobox', inline && 'Layer__LedgerAccountCombobox--inline', className)}>
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
        placeholder={placeholder}
        isReadOnly={isReadOnly}
        isInvalid={isInvalid}
        isLoading={isLoading}
        isClearable={false}
        {...additionalAriaProps}
      />
    </div>
  )
}

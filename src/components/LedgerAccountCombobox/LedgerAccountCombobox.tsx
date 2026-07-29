import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'

import { type CategoryAsOption } from '@internal-types/categorizationOption'
import { type CategoriesListMode, type Classification } from '@schemas/categorization'
import { findCategoryOption } from '@utils/categories'
import { flattenCategories, withoutExclusions } from '@utils/categoryOptions'
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
  const { data: allCategories, isLoading } = useCategories({ mode })
  const categories = useMemo(() => withoutExclusions(allCategories ?? []), [allCategories])

  const groups = useMemo(() => flattenCategories(categories), [categories])

  const selectedCategory = useMemo(
    () => findCategoryOption(groups.flatMap(group => group.options), value),
    [groups, value],
  )

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
        groups={groups}
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

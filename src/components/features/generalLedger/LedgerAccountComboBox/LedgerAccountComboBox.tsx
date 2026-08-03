import { useCallback, useId, useMemo } from 'react'

import { type CategoryAsOption } from '@internal-types/categorizationOption'
import { type CategoriesListMode, type Classification } from '@schemas/categorization'
import { findCategoryOption } from '@utils/categories'
import { flattenCategories, withoutExclusions } from '@utils/categoryOptions'
import { useGetCategories } from '@api/businesses/[business-id]/categories/get'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { Label } from '@ui/Typography/Text'
import { formFieldLayoutProps } from '@blocks/forms/FormFieldShell'

type LedgerAccountComboBoxProps = {
  label: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
  mode?: CategoriesListMode
  placeholder?: string
  hideExclusions?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  showLabel?: boolean
  inline?: boolean
  className?: string
}

export const LedgerAccountComboBox = ({
  label,
  value,
  mode,
  onValueChange,
  placeholder,
  hideExclusions,
  isReadOnly,
  isInvalid,
  showLabel,
  inline,
  className,
}: LedgerAccountComboBoxProps) => {
  const { data: allCategories, isLoading } = useGetCategories({ mode })
  const categories = useMemo(
    () => hideExclusions ? withoutExclusions(allCategories ?? []) : allCategories ?? [],
    [allCategories, hideExclusions],
  )

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
    <div {...formFieldLayoutProps({ className, inline })}>
      {showLabel && (
        <Label slot='label' size='sm' htmlFor={inputId}>
          {label}
        </Label>
      )}
      <ComboBox
        slot='input'
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

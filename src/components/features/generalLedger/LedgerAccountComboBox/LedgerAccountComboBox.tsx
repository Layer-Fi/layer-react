import { useCallback, useMemo } from 'react'

import { type CategoryAsOption } from '@internal-types/features/categorization/categorizationOption'
import { type CategoriesListMode } from '@schemas/categorization/categoryList'
import { type Classification } from '@schemas/categorization/classification'
import { findCategoryOption } from '@utils/features/categorization/categories'
import { flattenCategories, withoutExclusions } from '@utils/features/categorization/categoryOptions'
import { useGetCategories } from '@api/businesses/[business-id]/categories/get'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'

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

  return (
    <ComboBoxField label={label} className={className} inline={inline} showLabel={showLabel}>
      {controlProps => (
        <ComboBox
          {...controlProps}
          groups={groups}
          onSelectedValueChange={onSelectedValueChange}
          selectedValue={selectedCategory}
          placeholder={placeholder}
          isReadOnly={isReadOnly}
          isInvalid={isInvalid}
          isLoading={isLoading}
          isClearable={false}
        />
      )}
    </ComboBoxField>
  )
}

import { useCallback, useMemo } from 'react'
import classNames from 'classnames'

import { type CategoryAsOption } from '@internal-types/features/categorization/categorizationOption'
import { type CategoriesListMode } from '@schemas/features/categorization/categoryList'
import { type Classification } from '@schemas/features/categorization/classification'
import { findCategoryOption } from '@utils/features/categorization/categories'
import { flattenCategories, withoutExclusions } from '@utils/features/categorization/categoryOptions'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useGetCategories } from '@api/businesses/[business-id]/categories/get'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'

/*
 * The wrapper div became a shared `ComboBoxField`, so neither generation of this name survives.
 * Both are emitted here, at this one usage, rather than on `ComboBoxField` itself — that is shared
 * with every other combo box field in the package.
 */
const legacyClassNames = createLegacyClassNames({
  'Layer__LedgerAccountComboBox': 'Layer__LedgerAccountCombobox',
  'Layer__LedgerAccountComboBox--inline': 'Layer__LedgerAccountCombobox--inline',
})

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
    <ComboBoxField
      label={label}
      className={classNames(
        legacyClassNames('Layer__LedgerAccountComboBox', inline && 'Layer__LedgerAccountComboBox--inline'),
        className,
      )}
      inline={inline}
      showLabel={showLabel}
    >
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

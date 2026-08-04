import { useCallback, useMemo } from 'react'

import { CategoryAsOption } from '@internal-types/categorizationOption'
import { type CategoriesListMode } from '@schemas/categorization/categoryList'
import { type Classification } from '@schemas/categorization/classification'
import { findCategoryOption, flattenCategories } from '@utils/categories'
import { useGetCategories } from '@api/businesses/[business-id]/categories/get'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/categorization/BankTransactionsCategorizationStore/utils'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { CategorySelectDrawerWithTrigger } from '@features/categorization/CategorySelectDrawerWithTrigger/CategorySelectDrawerWithTrigger'

type CategoryMobileDrawerProps = {
  label: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
  mode: CategoriesListMode
  hideExclusions?: boolean
  showLabel?: boolean
  placeholder?: string
}

export const CategoryMobileDrawer = ({
  label,
  value,
  onValueChange,
  mode,
  hideExclusions,
  showLabel,
  placeholder,
}: CategoryMobileDrawerProps) => {
  const { data: categories } = useGetCategories({ mode })

  const flatOptions = useMemo(() => {
    if (!categories) return []
    return flattenCategories(categories).map(category => new CategoryAsOption(category))
  }, [categories])

  const selectedOption = useMemo(
    () => findCategoryOption(flatOptions, value),
    [flatOptions, value],
  )

  const handleSelectedValueChange = useCallback(
    (option: BankTransactionNonSuggestedMatchOption | null) => {
      onValueChange(option instanceof CategoryAsOption ? option.classification : null)
    },
    [onValueChange],
  )

  return (
    <VStack gap='3xs'>
      {showLabel && <Label size='sm'>{label}</Label>}
      <CategorySelectDrawerWithTrigger
        selectedValue={selectedOption}
        onSelectedValueChange={handleSelectedValueChange}
        showTooltips={false}
        mode={mode}
        hideExclusions={hideExclusions}
        slotProps={{ TriggerSpan: { size: 'sm' } }}
        placeholder={placeholder}
      />
    </VStack>
  )
}

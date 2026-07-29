import { useCallback, useMemo } from 'react'

import { CategoryAsOption } from '@internal-types/categorizationOption'
import { CategoriesListMode, type Classification } from '@schemas/categorization'
import { findCategoryOption, flattenCategories } from '@utils/categories'
import { useCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'

type CategoryMobileDrawerProps = {
  label: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
  showLabel?: boolean
}

export const CategoryMobileDrawer = ({
  label,
  value,
  onValueChange,
  showLabel,
}: CategoryMobileDrawerProps) => {
  const { data: categories } = useCategories({ mode: CategoriesListMode.All })

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
        slotProps={{ TriggerSpan: { size: 'sm' } }}
      />
    </VStack>
  )
}

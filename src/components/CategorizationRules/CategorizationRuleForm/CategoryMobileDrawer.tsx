import { useCallback, useMemo } from 'react'

import { getLeafCategories } from '@internal-types/categories'
import { CategoryAsOption } from '@internal-types/categorizationOption'
import { type Classification, ClassificationEquivalence } from '@schemas/categorization'
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
  const { data: categories } = useCategories()

  const flatOptions = useMemo(() => {
    if (!categories) return []
    return getLeafCategories(categories).map(category => new CategoryAsOption(category))
  }, [categories])

  const selectedOption = useMemo(() => {
    if (!value) return null
    return flatOptions.find(option => ClassificationEquivalence(value, option.classification)) ?? null
  }, [flatOptions, value])

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

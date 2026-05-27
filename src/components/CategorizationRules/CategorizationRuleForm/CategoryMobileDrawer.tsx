import { useCallback, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getLeafCategories } from '@internal-types/categories'
import { CategoryAsOption } from '@internal-types/categorizationOption'
import { type Classification, ClassificationEquivalence } from '@schemas/categorization'
import { useCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import ChevronDown from '@icons/ChevronDown'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'

type CategoryMobileDrawerProps = {
  label: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
  showLabel?: boolean
  isReadOnly?: boolean
  placeholder?: string
}

export const CategoryMobileDrawer = ({
  label,
  value,
  onValueChange,
  showLabel,
  isReadOnly,
  placeholder,
}: CategoryMobileDrawerProps) => {
  const { t } = useTranslation()
  const inputId = useId()
  const [isOpen, setIsOpen] = useState(false)
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
      if (option instanceof CategoryAsOption) {
        onValueChange(option.classification)
        return
      }
      onValueChange(null)
    },
    [onValueChange],
  )

  const triggerLabel = selectedOption?.label
    ?? placeholder
    ?? t('common:action.select_label', 'Select…')

  return (
    <VStack gap='3xs'>
      {showLabel && (
        <Label size='sm' htmlFor={inputId}>{label}</Label>
      )}
      <Button
        id={inputId}
        onPress={() => setIsOpen(true)}
        variant='outlined'
        isDisabled={isReadOnly}
        fullWidth
        flex
        aria-label={label}
      >
        <HStack fluid justify='space-between' align='center'>
          <Span size='sm' ellipsis>{triggerLabel}</Span>
          {!isReadOnly && <ChevronDown size={16} />}
        </HStack>
      </Button>
      <CategorySelectDrawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        selectedValue={selectedOption}
        onSelectedValueChange={handleSelectedValueChange}
        showTooltips={false}
      />
    </VStack>
  )
}

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CategoriesListMode } from '@schemas/categorization'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span, type TextStyleProps } from '@ui/Typography/Text'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'

import './categorySelectDrawerWithTrigger.scss'

type CategorySelectDrawerWithTriggerProps = {
  selectedValue: BankTransactionNonSuggestedMatchOption | null
  onSelectedValueChange: (newValue: BankTransactionNonSuggestedMatchOption | null) => void
  placeholder?: string
  showTooltips: boolean
  hideExclusions?: boolean
  mode?: CategoriesListMode
  slotProps?: {
    TriggerSpan?: TextStyleProps
  }
}

export const CategorySelectDrawerWithTrigger = ({
  selectedValue,
  onSelectedValueChange,
  placeholder,
  showTooltips,
  hideExclusions,
  mode,
  slotProps,
}: CategorySelectDrawerWithTriggerProps) => {
  const { t } = useTranslation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <HStack fluid className='Layer__CategorySelectDrawerWithTrigger'>
      <Button
        fullWidth
        aria-label={t('bankTransactions:action.select_category', 'Select category')}
        onClick={() => { setIsDrawerOpen(true) }}
        variant='outlined'
      >
        <Span ellipsis size='md' {...slotProps?.TriggerSpan}>
          {selectedValue?.label ?? placeholder ?? t('common:action.select_label', 'Select…')}
        </Span>
        <ChevronDown size={16} />
      </Button>

      <CategorySelectDrawer
        onSelectedValueChange={onSelectedValueChange}
        selectedValue={selectedValue}
        showTooltips={showTooltips}
        hideExclusions={hideExclusions}
        mode={mode}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </HStack>
  )
}

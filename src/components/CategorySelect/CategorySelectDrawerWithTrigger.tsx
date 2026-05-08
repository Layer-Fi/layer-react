import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import ChevronDown from '@icons/ChevronDown'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'

import './categorySelectDrawerWithTrigger.scss'

type CategorySelectDrawerWithTriggerProps = {
  selectedValue: BankTransactionNonSuggestedMatchOption | null
  onSelectedValueChange: (newValue: BankTransactionNonSuggestedMatchOption | null) => void
  showTooltips: boolean
}

export const CategorySelectDrawerWithTrigger = ({
  selectedValue,
  onSelectedValueChange,
  showTooltips,
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
        <Span ellipsis>{selectedValue?.label ?? t('common:action.select_label', 'Select...')}</Span>
        <ChevronDown size={16} />
      </Button>

      <CategorySelectDrawer
        onSelectedValueChange={onSelectedValueChange}
        selectedValue={selectedValue}
        showTooltips={showTooltips}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </HStack>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronDown from '@icons/ChevronDown'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'

import './categorySelectDrawerWithTrigger.scss'

type Props = {
  value: BankTransactionCategoryComboBoxOption | null
  onChange: (newValue: BankTransactionCategoryComboBoxOption | null) => void
  disabled?: boolean
  showTooltips: boolean
}

export const CategorySelectDrawerWithTrigger = ({ value, onChange, showTooltips }: Props) => {
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
        <Span ellipsis>{value?.label ?? t('common:action.select_label', 'Select...')}</Span>
        <ChevronDown size={16} />
      </Button>

      <CategorySelectDrawer
        onSelect={onChange}
        selectedId={value?.value}
        showTooltips={showTooltips}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </HStack>
  )
}

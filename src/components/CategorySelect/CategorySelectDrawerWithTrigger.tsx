import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronRight from '@icons/ChevronRight'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'

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
    <HStack fluid>
      <Button
        flex
        fullWidth
        aria-label={t('bankTransactions:action.select_category', 'Select category')}
        onClick={() => { setIsDrawerOpen(true) }}
        variant='outlined'
      >
        <HStack fluid align='center' justify='space-between' gap='2xs'>
          <Span size='sm' ellipsis variant={value ? undefined : 'placeholder'}>
            {value?.label ?? t('common:action.select_label', 'Select...')}
          </Span>
          <ChevronRight size={16} />
        </HStack>
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

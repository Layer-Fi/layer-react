import { useState } from 'react'

import ChevronDown from '@icons/ChevronDown'
import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'
import { Button } from '@ui/Button/Button'
import { HStack, Spacer } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

type Props = {
  value: BankTransactionCategoryComboBoxOption | null
  onChange: (newValue: BankTransactionCategoryComboBoxOption | null) => void
  disabled?: boolean
  showTooltips: boolean
}

export const CategorySelectDrawerWithTrigger = ({ value, onChange, showTooltips }: Props) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <HStack fluid>
      <Button
        flex
        fullWidth
        aria-label='Select category'
        onClick={() => { setIsDrawerOpen(true) }}
        variant='outlined'
      >
        <Span>{value?.label ?? 'Select...'}</Span>
        <Spacer />
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

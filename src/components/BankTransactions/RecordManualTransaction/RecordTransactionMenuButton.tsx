import { useCallback } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Spacer } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

function RecordTransactionTrigger({ isDisabled }: { isDisabled?: boolean }) {
  const { t } = useTranslation()

  return (
    <Button
      icon
      variant='outlined'
      isDisabled={isDisabled}
      aria-label={t('bankTransactions:action.record_transaction', 'Record transaction')}
    >
      <Plus size={14} />
    </Button>
  )
}

type RecordTransactionMenuButtonProps = {
  isDisabled?: boolean
}

export function RecordTransactionMenuButton({ isDisabled }: RecordTransactionMenuButtonProps) {
  const { t } = useTranslation()

  const Trigger = useCallback(() => <RecordTransactionTrigger isDisabled={isDisabled} />, [isDisabled])

  return (
    <DropdownMenu
      ariaLabel={t('bankTransactions:action.record_transaction', 'Record transaction')}
      slots={{ Trigger }}
      slotProps={{ Dialog: { width: 180 } }}
    >
      <MenuList>
        <MenuItem>
          <Span size='sm'>{t('bankTransactions:action.record_expense', 'Record expense')}</Span>
          <Spacer />
          <ChevronRight size={12} />
        </MenuItem>
        <MenuItem>
          <Span size='sm'>{t('bankTransactions:action.record_income', 'Record income')}</Span>
          <Spacer />
          <ChevronRight size={12} />
        </MenuItem>
      </MenuList>
    </DropdownMenu>
  )
}

import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
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
      variant='compact'
      ariaLabel={t('bankTransactions:action.record_transaction', 'Record transaction')}
      slots={{ Trigger }}
    >
      <MenuList>
        <MenuItem>
          <Span size='sm'>{t('bankTransactions:action.record_expense', 'Record expense')}</Span>
        </MenuItem>
        <MenuItem>
          <Span size='sm'>{t('bankTransactions:action.record_income', 'Record income')}</Span>
        </MenuItem>
      </MenuList>
    </DropdownMenu>
  )
}

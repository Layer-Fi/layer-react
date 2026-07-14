import { useCallback, useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Spacer } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { RecordTransactionModal } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionModal'
import { type RecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'

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
  const [openVariant, setOpenVariant] = useState<RecordTransactionVariant | null>(null)

  const Trigger = useCallback(() => <RecordTransactionTrigger isDisabled={isDisabled} />, [isDisabled])

  return (
    <>
      <DropdownMenu
        ariaLabel={t('bankTransactions:action.record_transaction', 'Record transaction')}
        slots={{ Trigger }}
        slotProps={{ Dialog: { width: 180 } }}
      >
        <MenuList>
          <MenuItem onClick={() => setOpenVariant('expense')}>
            <Span size='sm'>{t('bankTransactions:action.record_expense', 'Record expense')}</Span>
            <Spacer />
            <ChevronRight size={12} />
          </MenuItem>
          <MenuItem onClick={() => setOpenVariant('income')}>
            <Span size='sm'>{t('bankTransactions:action.record_income', 'Record income')}</Span>
            <Spacer />
            <ChevronRight size={12} />
          </MenuItem>
        </MenuList>
      </DropdownMenu>
      {openVariant !== null && (
        <RecordTransactionModal
          variant={openVariant}
          isOpen
          onOpenChange={isOpen => setOpenVariant(isOpen ? openVariant : null)}
        />
      )}
    </>
  )
}

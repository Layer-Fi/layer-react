import { useCallback, useMemo } from 'react'
import { PencilRuler, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, type DropdownMenuItem, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Span } from '@ui/Typography/Text'

type BankTransactionActionsCellProps = {
  bankTransaction: BankTransaction
  onCreateRule?: (bankTransaction: BankTransaction) => void
}

export const BankTransactionActionsCell = ({
  bankTransaction,
  onCreateRule,
}: BankTransactionActionsCellProps) => {
  const { t } = useTranslation()

  const Trigger = useCallback(() => (
    <Button
      icon
      inset
      variant='ghost'
      aria-label={t('bankTransactions:label.transaction_actions', 'Transaction actions')}
    >
      <Plus size={16} />
    </Button>
  ), [t])

  const items = useMemo<DropdownMenuItem[]>(() => {
    if (!onCreateRule) return []

    return [{
      key: 'CreateCategorizationRule',
      onClick: () => onCreateRule(bankTransaction),
      slots: { Icon: PencilRuler },
      label: t('bankTransactions:action.create_a_rule', 'Create a rule'),
    }]
  }, [t, bankTransaction, onCreateRule])

  if (items.length === 0) return null

  return (
    <DropdownMenu
      ariaLabel={t('bankTransactions:label.transaction_actions', 'Transaction actions')}
      slots={{ Trigger }}
      variant='compact'
    >
      <MenuList>
        {items.map(({ key, label, onClick, isDisabled, slots }) => (
          <MenuItem key={key} onClick={onClick} isDisabled={isDisabled}>
            {slots?.Icon && <slots.Icon size={14} />}
            <Span size='sm'>{label}</Span>
          </MenuItem>
        ))}
      </MenuList>
    </DropdownMenu>
  )
}

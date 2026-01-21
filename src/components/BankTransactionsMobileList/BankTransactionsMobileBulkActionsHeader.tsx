import { useCallback } from 'react'
import { EllipsisVertical, ListChecks, PencilRuler } from 'lucide-react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import { useBankTransactionsTableCheckboxState } from '@hooks/useBankTransactions/useBankTransactionsTableCheckboxState'
import { useBankTransactionsNavigation } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

interface BankTransactionsMobileBulkActionsHeaderProps {
  bankTransactions?: BankTransaction[]
  bulkActionsEnabled: boolean
  onBulkActionsToggle: (enabled: boolean) => void
}

export const BankTransactionsMobileBulkActionsHeader = ({
  bankTransactions,
  bulkActionsEnabled,
  onBulkActionsToggle,
}: BankTransactionsMobileBulkActionsHeaderProps) => {
  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions })
  const { toCategorizationRulesTable } = useBankTransactionsNavigation()
  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

  const MenuTrigger = useCallback(() => (
    <Button icon variant='ghost'>
      <EllipsisVertical size={16} />
    </Button>
  ), [])

  if (!categorizationEnabled) {
    return null
  }

  return (
    <HStack
      gap='md'
      align='center'
      justify='space-between'
      pi='md'
      pb='xs'
    >
      <HStack
        align='center'
        gap='xs'
      >
        {bulkActionsEnabled && (
          <>
            <Checkbox
              size='md'
              isSelected={isAllSelected}
              isIndeterminate={isPartiallySelected}
              onChange={onHeaderCheckboxChange}
              aria-label='Select all transactions on this page'
            />
            <Span
              size='md'
            >
              Select all
            </Span>
          </>
        )}
      </HStack>
      <DropdownMenu
        ariaLabel='Transaction actions menu'
        slots={{ Trigger: MenuTrigger }}
        slotProps={{ Dialog: { width: 250 } }}
      >
        <MenuList>
          <MenuItem onClick={() => onBulkActionsToggle(!bulkActionsEnabled)}>
            <ListChecks size={16} />
            <Span size='sm'>{bulkActionsEnabled ? 'Disable Bulk Actions' : 'Enable Bulk Actions'}</Span>
          </MenuItem>
          <MenuItem onClick={toCategorizationRulesTable}>
            <PencilRuler size={16} strokeWidth={1.25} />
            <Span size='sm'>Manage Categorization Rules</Span>
          </MenuItem>
        </MenuList>
      </DropdownMenu>
    </HStack>
  )
}

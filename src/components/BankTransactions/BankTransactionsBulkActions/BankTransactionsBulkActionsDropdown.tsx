import { useState } from 'react'
import { DropdownMenu, MenuList, MenuItem } from '../../ui/DropdownMenu/DropdownMenu'
import { Button } from '../../ui/Button/Button'
import { Span } from '../../ui/Typography/Text'
import { BankTransactionsCategorizeAllModal } from './BankTransactionsCategorizeAllModal'
import { BankTransactionsConfirmAllModal } from './BankTransactionsConfirmAllModal'
import { BankTransactionsUncategorizeAllModal } from './BankTransactionsUncategorizeAllModal'
import { CategorizationMode } from './BankTransactionsCategorizeAllButton'
import { useBankTransactionsContext } from '../../../contexts/BankTransactionsContext'
import { DisplayState } from '../../../types/bank_transactions'
import { HStack } from '../../ui/Stack/Stack'
import { ChevronDown } from 'lucide-react'
import './BankTransactionsBulkActionsDropdown.scss'

export const BankTransactionsBulkActionsDropdown = () => {
  const { display } = useBankTransactionsContext()
  const [categorizeModalOpen, setCategorizeModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [uncategorizeModalOpen, setUncategorizeModalOpen] = useState(false)

  const MenuTriggerButton = () => (
    <Button variant='solid'>
      <HStack
        gap='md'
        align='center'
        className='Layer__bank-transactions__bulk-actions-dropdown'
      >
        <Span size='md'>Bulk Actions</Span>
        <ChevronDown size={16} />
      </HStack>
    </Button>
  )

  return (
    <HStack pis='md' align='center'>
      <DropdownMenu
        ariaLabel='Bulk actions'
        slots={{ Trigger: MenuTriggerButton }}
        slotProps={{
          Dialog: { width: '8rem' },
        }}
      >
        <MenuList>
          {display === DisplayState.review
            ? (
              <>
                <MenuItem key='set-category' onClick={() => setCategorizeModalOpen(true)}>
                  <Span size='sm'>Set category</Span>
                </MenuItem>
                <MenuItem key='confirm-all' onClick={() => setConfirmModalOpen(true)}>
                  <Span size='sm'>Confirm all</Span>
                </MenuItem>
              </>
            )
            : (
              <>
                <MenuItem key='recategorize-all' onClick={() => setCategorizeModalOpen(true)}>
                  <Span size='sm'>Recategorize all</Span>
                </MenuItem>
                <MenuItem key='uncategorize-all' onClick={() => setUncategorizeModalOpen(true)}>
                  <Span size='sm'>Uncategorize all</Span>
                </MenuItem>
              </>
            )}
        </MenuList>
      </DropdownMenu>

      <BankTransactionsCategorizeAllModal
        isOpen={categorizeModalOpen}
        onOpenChange={setCategorizeModalOpen}
        mode={display === DisplayState.review ? CategorizationMode.Categorize : CategorizationMode.Recategorize}
      />
      <BankTransactionsConfirmAllModal
        isOpen={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
      />
      <BankTransactionsUncategorizeAllModal
        isOpen={uncategorizeModalOpen}
        onOpenChange={setUncategorizeModalOpen}
      />
    </HStack>
  )
}

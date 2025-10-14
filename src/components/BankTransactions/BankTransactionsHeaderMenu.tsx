import { useCallback, useState } from 'react'
import { useBankTransactionsNavigation } from '../../providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { Button } from '../ui/Button/Button'
import { MenuIcon } from 'lucide-react'
import { DropdownMenu, MenuItem, MenuList } from '../ui/DropdownMenu/DropdownMenu'
import { Span } from '../ui/Typography/Text'
import { BankTransactionsUploadModal } from './BankTransactionsUploadModal/BankTransactionsUploadModal'

interface BankTransactionsHeaderMenuProps {
  withUploadMenu?: boolean
}

enum BankTransactionsHeaderMenuActions {
  UploadTransactions = 'UploadTransactions',
  ManageCategorizationRules = 'ManageCategorizationRules',
}

export const BankTransactionsHeaderMenu = ({ withUploadMenu }: BankTransactionsHeaderMenuProps) => {
  const { toCategorizationRulesTable } = useBankTransactionsNavigation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined'>
        <MenuIcon size={14} />
      </Button>
    )
  }, [])
  return (
    <>
      <DropdownMenu
        ariaLabel='Additional bank transactions actions'
        slots={{ Trigger }}
        slotProps={{ Dialog: { width: 200 } }}
        variant='compact'
      >
        <MenuList>
          {withUploadMenu && (
            <MenuItem key={BankTransactionsHeaderMenuActions.UploadTransactions} onClick={() => setIsModalOpen(true)}>
              <Span size='sm'>Upload transactions manually</Span>
            </MenuItem>
          )}
          <MenuItem key={BankTransactionsHeaderMenuActions.ManageCategorizationRules} onClick={toCategorizationRulesTable}>
            <Span size='sm'>Manage categorization rules</Span>
          </MenuItem>
        </MenuList>
      </DropdownMenu>
      {isModalOpen && <BankTransactionsUploadModal isOpen onOpenChange={setIsModalOpen} />}
    </>
  )
}

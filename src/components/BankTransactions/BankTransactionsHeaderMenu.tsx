import { Button } from '../ui/Button/Button'
import { ReactNode, useCallback, useState } from 'react'
import { useBankTransactionsNavigation } from '../../providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { MenuIcon } from 'lucide-react'
import { DropdownMenu, MenuItem, MenuList } from '../ui/DropdownMenu/DropdownMenu'
import { Span } from '../ui/Typography/Text'
import { BankTransactionsUploadModal } from './BankTransactionsUploadModal/BankTransactionsUploadModal'
import { Spacer, VStack } from '../ui/Stack/Stack'
import UploadCloud from '../../icons/UploadCloud'
import { ChevronRight, PencilRuler } from 'lucide-react'

interface BankTransactionsHeaderMenuProps {
  withUploadMenu?: boolean
  isDisabled?: boolean
}

enum BankTransactionsHeaderMenuActions {
  UploadTransactions = 'UploadTransactions',
  ManageCategorizationRules = 'ManageCategorizationRules',
}

interface BankTransactionsHeaderMenuIconProps {
  menuKey: BankTransactionsHeaderMenuActions
  onClick: () => void
  icon: ReactNode
  label: string
}

const BankTransactionsHeaderMenuIcon = ({
  menuKey,
  onClick,
  icon,
  label,
}: BankTransactionsHeaderMenuIconProps) => {
  return (
    <MenuItem key={menuKey} onClick={onClick}>
      <VStack className='Layer__bank-transactions__header-menu__icon'>
        {icon}
      </VStack>
      <Span size='sm'>{label}</Span>
      <Spacer />
      <ChevronRight size={12} />
    </MenuItem>
  )
}

export const BankTransactionsHeaderMenu = ({ withUploadMenu, isDisabled }: BankTransactionsHeaderMenuProps) => {
  const { toCategorizationRulesTable } = useBankTransactionsNavigation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined' isDisabled={isDisabled}>
        <MenuIcon size={14} />
      </Button>
    )
  }, [isDisabled])
  return (
    <>
      <DropdownMenu
        ariaLabel='Additional bank transactions actions'
        slots={{ Trigger }}
        slotProps={{ Dialog: { width: 250 } }}
      >
        <MenuList>
          {withUploadMenu && (
            <BankTransactionsHeaderMenuIcon
              menuKey={BankTransactionsHeaderMenuActions.UploadTransactions}
              onClick={() => setIsModalOpen(true)}
              icon={<UploadCloud size={16} />}
              label='Upload transactions manually'
            />
          )}
          <BankTransactionsHeaderMenuIcon
            menuKey={BankTransactionsHeaderMenuActions.ManageCategorizationRules}
            onClick={toCategorizationRulesTable}
            icon={<PencilRuler size={16} strokeWidth={1.25} />}
            label='Manage categorization rules'
          />
        </MenuList>
      </DropdownMenu>
      {isModalOpen && <BankTransactionsUploadModal isOpen onOpenChange={setIsModalOpen} />}
    </>
  )
}

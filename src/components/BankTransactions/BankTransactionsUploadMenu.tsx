import { Heading } from '../ui/Typography/Heading'
import { Button } from '../ui/Button/Button'
import { useState } from 'react'
import { DropdownMenu, MenuList, MenuItem } from '../ui/DropdownMenu/DropdownMenu'
import { Spacer, VStack } from '../ui/Stack/Stack'
import { ChevronRight } from 'lucide-react'
import UploadCloud from '../../icons/UploadCloud'
import { BankTransactionsUploadModal } from './BankTransactionsUploadModal/BankTransactionsUploadModal'
import { Span } from '../ui/Typography/Text'

interface BankTransactionsUploadMenuProps {
  isDisabled?: boolean
}

export const BankTransactionsUploadMenu = ({ isDisabled }: BankTransactionsUploadMenuProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const MenuTriggerButton = () => (
    <Button variant='outlined' icon isDisabled={isDisabled}>
      <UploadCloud size={12} />
    </Button>
  )

  return (
    <>
      <DropdownMenu
        ariaLabel='Upload transactions'
        slots={{ Trigger: MenuTriggerButton }}
        slotProps={{
          Dialog: { width: '18rem' },
        }}
      >
        <Heading weight='bold' size='2xs'>Choose how to upload transactions</Heading>
        <MenuList>
          <MenuItem key='upload-txns' onClick={() => setIsModalOpen(true)}>
            <VStack className='Layer__bank-transactions__header-menu__icon'>
              <UploadCloud size={16} />
            </VStack>
            <Span size='sm'>Upload transactions manually</Span>
            <Spacer />
            <ChevronRight size={12} />
          </MenuItem>
        </MenuList>
      </DropdownMenu>
      {isModalOpen && <BankTransactionsUploadModal isOpen onOpenChange={setIsModalOpen} />}
    </>
  )
}

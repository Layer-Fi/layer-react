import { useState } from 'react'
import { DropdownMenu, MenuList, MenuItem } from '../ui/DropdownMenu/DropdownMenu'
import { Button } from '../ui/Button/Button'
import { Spacer, VStack } from '../ui/Stack/Stack'
import { ChevronRight } from 'lucide-react'
import UploadCloud from '../../icons/UploadCloud'
import { BankTransactionsUploadModal } from './BankTransactionsUploadModal/BankTransactionsUploadModal'
import { Span } from '../ui/Typography/Text'
import { Heading } from '../ui/Typography/Heading'

const MenuTriggerButton = () => (
  <Button variant='outlined' icon>
    <UploadCloud size={12} />
  </Button>
)

export const BankTransactionsUploadMenu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
            <VStack className='Layer__bank-transactions__header-menu__upload-transactions-icon'>
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

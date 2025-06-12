import { useState } from 'react'
import { DropdownMenu, Heading, MenuList, MenuItem } from '../ui/DropdownMenu/DropdownMenu'
import { Text, TextSize } from '../Typography'
import { Button } from '../ui/Button/Button'
import { Spacer, VStack } from '../ui/Stack/Stack'
import { ChevronRight } from 'lucide-react'
import UploadCloud from '../../icons/UploadCloud'
import { BankTransactionsUploadModal } from './BankTransactionsUploadModal/BankTransactionsUploadModal'

const MenuTriggerButton = ({ iconOnly }: { iconOnly?: boolean }) => (
  <Button variant='ghost' {...(iconOnly && { icon: true })} persistentBorder={iconOnly}>
    {!iconOnly && 'Upload'}
    <UploadCloud size={12} />
  </Button>
)

export const BankTransactionsUploadMenu = ({ iconOnly }: { iconOnly?: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <DropdownMenu
        ariaLabel='Upload transactions'
        slots={{ Trigger: () => <MenuTriggerButton iconOnly={iconOnly} /> }}
        slotProps={{
          Dialog: { width: '18rem' },
        }}
      >
        <Heading>Choose how to upload transactions</Heading>
        <MenuList>
          <MenuItem key='upload-txns' onClick={() => setIsModalOpen(true)}>
            <VStack className='Layer__bank-transactions__header-menu__upload-transactions-icon'>
              <UploadCloud size={16} />
            </VStack>
            <Text size={TextSize.sm}>
              Upload transactions manually
            </Text>
            <Spacer />
            <ChevronRight size={12} />
          </MenuItem>
        </MenuList>
      </DropdownMenu>
      <BankTransactionsUploadModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}

import { type Customer } from '@schemas/customer'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { CustomerForm } from '@components/CustomerForm/CustomerForm'

export type CustomerFormDrawerProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  customer: Customer | null
  onSuccess: (customer: Customer) => void
}

export const CustomerFormDrawer = ({
  isOpen,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerFormDrawerProps) => {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      aria-label={customer ? 'Edit customer details' : 'Add customer'}
    >
      {({ close }) => (
        <VStack pb='lg'>
          <VStack pi='md'>
            <ModalTitleWithClose
              heading={(
                <ModalHeading size='md'>
                  {customer ? 'Edit customer details' : 'Add customer'}
                </ModalHeading>
              )}
              onClose={close}
            />
          </VStack>
          <VStack pi='md'>
            <CustomerForm customer={customer} onSuccess={onSuccess} />
          </VStack>
        </VStack>
      )}
    </Drawer>
  )
}

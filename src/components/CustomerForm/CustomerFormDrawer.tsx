import { useCallback } from 'react'

import { type Customer } from '@schemas/customer'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { CustomerForm } from '@components/CustomerForm/CustomerForm'
import { type CustomerFormState } from '@components/CustomerForm/formUtils'
import { UpsertCustomerMode } from '@features/customers/api/useUpsertCustomer'

export type CustomerFormDrawerProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSuccess: (customer: Customer) => void
  formState: CustomerFormState | null
}

const CustomerFormDrawerHeader = ({ title, close }: { title: string, close: () => void }) => (
  <ModalTitleWithClose
    heading={(
      <ModalHeading size='md'>
        {title}
      </ModalHeading>
    )}
    onClose={close}
  />
)

export const CustomerFormDrawer = (props: CustomerFormDrawerProps) => {
  const { isOpen, onOpenChange, onSuccess, formState } = props

  const title = formState?.mode === UpsertCustomerMode.Update ? 'Edit customer details' : 'Create new customer'
  const Header = useCallback(({ close }: { close: () => void }) => (
    <CustomerFormDrawerHeader title={title} close={close} />
  ), [title])

  if (formState === null) return null

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      aria-label={title}
      slots={{ Header }}
    >
      {() => (
        <VStack pb='lg'>
          <VStack pi='md'>
            <CustomerForm onSuccess={onSuccess} {...formState} />
          </VStack>
        </VStack>
      )}
    </Drawer>
  )
}

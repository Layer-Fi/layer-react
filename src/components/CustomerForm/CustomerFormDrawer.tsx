import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
import { UpsertCustomerMode } from '@hooks/api/businesses/[business-id]/customers/useUpsertCustomer'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { CustomerForm } from '@components/CustomerForm/CustomerForm'
import { type CustomerFormState } from '@components/CustomerForm/formUtils'

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
  const { t } = useTranslation()
  const { isOpen, onOpenChange, onSuccess, formState } = props

  const title = formState?.mode === UpsertCustomerMode.Update
    ? t('customerVendor:action.edit_customer_details', 'Edit customer details')
    : t('customerVendor:action.create_new_customer', 'Create new customer')
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
      <VStack pb='lg'>
        <VStack pi='md'>
          <CustomerForm onSuccess={onSuccess} {...formState} />
        </VStack>
      </VStack>
    </Drawer>
  )
}

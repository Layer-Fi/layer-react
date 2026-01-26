import { useCallback } from 'react'

import { useInvoiceNavigation } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { InvoicePaymentForm } from '@components/Invoices/InvoicePaymentForm/InvoicePaymentForm'
import { updateInvoiceWithPayment, UpsertDedicatedInvoicePaymentMode } from '@features/invoices/api/useUpsertDedicatedInvoicePayment'
import { type InvoicePayment } from '@features/invoices/invoicePaymentSchemas'
import { type Invoice } from '@features/invoices/invoiceSchemas'

export type InvoicePaymentDrawerProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  invoice: Invoice
}

const InvoicePaymentDrawerHeader = ({ close }: { close: () => void }) => (
  <ModalTitleWithClose
    heading={(
      <ModalHeading size='md'>
        Record invoice payment
      </ModalHeading>
    )}
    onClose={close}
  />
)

export const InvoicePaymentDrawer = ({
  isOpen,
  onOpenChange,
  invoice,
}: InvoicePaymentDrawerProps) => {
  const { addToast } = useLayerContext()
  const { toViewInvoice } = useInvoiceNavigation()

  const onSuccess = useCallback((invoicePayment: InvoicePayment) => {
    addToast({ content: 'Invoice paid successfully', type: 'success' })
    const updatedInvoice = updateInvoiceWithPayment(invoice, invoicePayment)
    toViewInvoice(updatedInvoice)
  }, [addToast, invoice, toViewInvoice])

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} slots={{ Header: InvoicePaymentDrawerHeader }}>
      {({ close }) => (
        <VStack pb='lg' gap='lg'>
          <InvoicePaymentForm
            onSuccess={(invoicePayment: InvoicePayment) => {
              onSuccess(invoicePayment)
              close()
            }}
            mode={UpsertDedicatedInvoicePaymentMode.Create}
            invoice={invoice}
          />
        </VStack>
      )}
    </Drawer>
  )
}

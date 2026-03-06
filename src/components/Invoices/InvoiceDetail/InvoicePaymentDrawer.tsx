import { useCallback } from 'react'

import { type Invoice } from '@schemas/invoices/invoice'
import { type InvoicePayment } from '@schemas/invoices/invoicePayment'
import { updateInvoiceWithPayment, UpsertDedicatedInvoicePaymentMode } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/payment/useUpsertDedicatedInvoicePayment'
import { useInvoiceNavigation } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { InvoicePaymentForm } from '@components/Invoices/InvoicePaymentForm/InvoicePaymentForm'

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
        <InvoicePaymentForm
          onSuccess={(invoicePayment: InvoicePayment) => {
            onSuccess(invoicePayment)
            close()
          }}
          mode={UpsertDedicatedInvoicePaymentMode.Create}
          invoice={invoice}
        />
      )}
    </Drawer>
  )
}

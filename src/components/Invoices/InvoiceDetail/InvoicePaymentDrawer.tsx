import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { type InvoicePayment } from '@schemas/invoices/invoicePayment'
import { updateInvoiceWithPayment } from '@api/businesses/[business-id]/invoices/[invoice-id]/payment/post'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
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

const InvoicePaymentDrawerHeader = ({ close }: { close: () => void }) => {
  const { t } = useTranslation()
  return (
    <ModalTitleWithClose
      heading={(
        <ModalHeading size='md'>
          {t('invoices:action.record_invoice_payment', 'Record invoice payment')}
        </ModalHeading>
      )}
      onClose={close}
    />
  )
}

export const InvoicePaymentDrawer = ({
  isOpen,
  onOpenChange,
  invoice,
}: InvoicePaymentDrawerProps) => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { toViewInvoice } = useInvoiceNavigation()

  const onSuccess = useCallback((invoicePayment: InvoicePayment) => {
    addToast({ content: t('invoices:label.invoice_paid_successfully', 'Invoice paid successfully'), type: 'success' })
    const updatedInvoice = updateInvoiceWithPayment(invoice, invoicePayment)
    toViewInvoice(updatedInvoice)
  }, [addToast, invoice, t, toViewInvoice])

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} slots={{ Header: InvoicePaymentDrawerHeader }}>
      {({ close }) => (
        <InvoicePaymentForm
          onSuccess={(invoicePayment: InvoicePayment) => {
            onSuccess(invoicePayment)
            close()
          }}
          mode={UpsertMode.Create}
          invoice={invoice}
        />
      )}
    </Drawer>
  )
}

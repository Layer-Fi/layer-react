import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/features/invoices/invoice'
import { type InvoicePayment } from '@schemas/features/invoices/invoicePayment'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { updateInvoiceWithPayment } from '@api/businesses/[business-id]/invoices/[invoice-id]/payment/post'
import { useInvoiceNavigation } from '@providers/features/invoices/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { InvoicePaymentForm } from '@features/invoices/InvoicePaymentForm/InvoicePaymentForm'

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
          {t('invoices:InvoicePaymentDrawer.action.record_invoice_payment', 'Record invoice payment')}
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
    addToast({ content: t('invoices:InvoicePaymentDrawer.label.invoice_paid_successfully', 'Invoice paid successfully'), type: 'success' })
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

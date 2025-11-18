import { ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@components/BaseConfirmationModal/BaseConfirmationModal'
import { InvoiceStatus, type Invoice } from '@features/invoices/invoiceSchemas'
import { useResetInvoice } from '@features/invoices/api/useResetInvoice'
import { useCallback } from 'react'

type InvoiceResetModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoice: Invoice
  onSuccess: (invoice: Invoice) => void
}

export function InvoiceResetModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceResetModalProps) {
  const { trigger: resetInvoice } = useResetInvoice({ invoiceId: invoice.id })

  const onConfirm = useCallback(async () => {
    const { data: updatedInvoice } = await resetInvoice()
    onSuccess(updatedInvoice)
  }, [onSuccess, resetInvoice])

  const description = invoice.status === InvoiceStatus.Voided
    ? 'Resetting this invoice will remove its current status as void and return it to a sent state.'
    : 'Resetting this invoice will delete all payments, refunds, and write offs associated with it and return it to a sent state.'

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Reset invoice to sent'
      description={description}
      onConfirm={onConfirm}
      confirmLabel='Reset Invoice'
      errorText='There was an error resetting this invoice. Please check your connection and try again in a few seconds.'
    />
  )
}

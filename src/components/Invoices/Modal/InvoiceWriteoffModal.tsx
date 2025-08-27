import { ModalProps } from '../../ui/Modal/Modal'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import type { Invoice } from '../../../features/invoices/invoiceSchemas'
import { updateInvoiceWithWriteoff, useWriteoffInvoice } from '../../../features/invoices/api/useWriteoffInvoice'
import { useCallback } from 'react'

type InvoiceWriteoffModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoice: Invoice
  onSuccess: (invoice: Invoice) => void
}

export function InvoiceWriteoffModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceWriteoffModalProps) {
  const { trigger: writeoffInvoice } = useWriteoffInvoice({ invoiceId: invoice.id })

  const onConfirm = useCallback(async () => {
    await writeoffInvoice({
      writeOffAt: new Date(),
      amount: invoice.outstandingBalance,
    }).then(() => onSuccess(updateInvoiceWithWriteoff(invoice)))
  }, [invoice, onSuccess, writeoffInvoice])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Write off invoice'
      description='Writing off this invoice will record it as bad debt, and you will no longer be able to apply payments to it. This action cannot be undone.'
      onConfirm={onConfirm}
      confirmLabel='Write Off Invoice'
      errorText='There was an error writing off this invoice. Please check your connection and try again in a few seconds.'
    />
  )
}

import { ModalProps } from '../../ui/Modal/Modal'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import type { Invoice } from '../../../features/invoices/invoiceSchemas'

type InvoiceResetModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoiceId: string
  onSuccess: (invoice: Invoice) => void
}

export function InvoiceResetModal({ isOpen, onOpenChange, invoiceId: _invoiceId }: InvoiceResetModalProps) {
  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Reset invoice to sent'
      description='Resetting this invoice will delete all payments, refunds, and write offs associated with it. This action cannot be undone.'
      onConfirm={() => {}}
      confirmLabel='Reset Invoice'
      errorText='There was an error resetting this invoice. Please check your connection and try again in a few seconds.'
    />
  )
}

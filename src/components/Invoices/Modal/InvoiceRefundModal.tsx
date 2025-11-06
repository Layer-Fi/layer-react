import { ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@components/BaseConfirmationModal/BaseConfirmationModal'
import type { Invoice } from '@features/invoices/invoiceSchemas'
import { useCallback, useMemo, useRef } from 'react'
import { InvoiceRefundForm } from '@components/Invoices/InvoiceRefundForm/InvoiceRefundForm'
import { updateInvoiceWithRefund } from '@features/invoices/api/useRefundInvoice'

type InvoiceRefundModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoice: Invoice
  onSuccess: (invoice: Invoice) => void
}
export function InvoiceRefundModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceRefundModalProps) {
  const formRef = useRef<{ submit: () => Promise<void> }>(null)

  const onConfirm = useCallback(() => formRef.current?.submit(), [])

  const onSuccessForm = useCallback(() => {
    onSuccess(updateInvoiceWithRefund(invoice))
    onOpenChange?.(false)
  }, [invoice, onOpenChange, onSuccess])

  const content = useMemo(() => (
    <InvoiceRefundForm invoice={invoice} onSuccess={onSuccessForm} ref={formRef} />
  ), [invoice, onSuccessForm])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Issue refund'
      content={content}
      onConfirm={onConfirm}
      confirmLabel='Refund Invoice'
      errorText='There was an error issuing a refund for this invoice. Please check your connection and try again in a few seconds.'
      closeOnConfirm={false}
    />
  )
}

import { useCallback } from 'react'

import { BaseConfirmationModal } from '@components/blocks/BaseConfirmationModal/BaseConfirmationModal/BaseConfirmationModal'
import { type ModalProps } from '@ui/Modal/Modal'
import { useVoidInvoice } from '@features/invoices/api/useVoidInvoice'
import type { Invoice } from '@features/invoices/invoiceSchemas'

type InvoiceVoidModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoiceId: string
  onSuccess: (invoice: Invoice) => void
}

export function InvoiceVoidModal({ isOpen, onOpenChange, invoiceId, onSuccess }: InvoiceVoidModalProps) {
  const { trigger: voidInvoice } = useVoidInvoice({ invoiceId })

  const onConfirm = useCallback(async () => {
    const { data: invoice } = await voidInvoice()
    onSuccess(invoice)
  }, [onSuccess, voidInvoice])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Void invoice'
      description='Voiding this invoice will mark it as cancelled, and you will no longer be able to apply payments to it. This action cannot be undone.'
      onConfirm={onConfirm}
      confirmLabel='Void Invoice'
      errorText='There was an error voiding this invoice. Please check your connection and try again in a few seconds.'
    />
  )
}

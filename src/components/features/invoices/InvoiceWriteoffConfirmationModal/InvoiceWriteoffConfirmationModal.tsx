import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { Invoice } from '@schemas/features/invoices/invoice'
import { updateInvoiceWithWriteoff, usePostWriteoffInvoice } from '@api/businesses/[business-id]/invoices/[invoice-id]/write-off/post'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type InvoiceWriteoffConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoice: Invoice
  onSuccess: (invoice: Invoice) => void
}

export function InvoiceWriteoffConfirmationModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceWriteoffConfirmationModalProps) {
  const { t } = useTranslation()
  const { trigger: writeoffInvoice } = usePostWriteoffInvoice({ invoiceId: invoice.id })

  const onConfirm = useCallback(async () => {
    await writeoffInvoice({
      writeOffAt: new Date(),
      amount: invoice.outstandingBalance,
    })
    onSuccess(updateInvoiceWithWriteoff(invoice))
  }, [invoice, onSuccess, writeoffInvoice])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('invoices:InvoiceWriteoffConfirmationModal.action.write_off_invoice', 'Write off invoice')}
      description={t('invoices:InvoiceWriteoffConfirmationModal.label.write_off_invoice_warning', 'Writing off this invoice will record it as bad debt, and you will no longer be able to apply payments to it. This action cannot be undone.')}
      onConfirm={onConfirm}
      confirmLabel={t('invoices:InvoiceWriteoffConfirmationModal.action.write_off_invoice', 'Write off invoice')}
      errorText={t('invoices:InvoiceWriteoffConfirmationModal.error.write_off_invoice', 'There was an error writing off this invoice. Please check your connection and try again in a few seconds.')}
    />
  )
}

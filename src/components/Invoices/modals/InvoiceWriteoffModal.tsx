import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { Invoice } from '@schemas/invoices/invoice'
import { updateInvoiceWithWriteoff, useWriteoffInvoice } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/write-off/useWriteoffInvoice'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type InvoiceWriteoffModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoice: Invoice
  onSuccess: (invoice: Invoice) => void
}

export function InvoiceWriteoffModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceWriteoffModalProps) {
  const { t } = useTranslation()
  const { trigger: writeoffInvoice } = useWriteoffInvoice({ invoiceId: invoice.id })

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
      title={t('writeOffInvoice', 'Write off invoice')}
      description={t('writingOffThisInvoiceWillRecordItAsBadDebtAndYouWillNoLongerBeAbleToApplyPaymentsToItThisActionCannotBeUndone', 'Writing off this invoice will record it as bad debt, and you will no longer be able to apply payments to it. This action cannot be undone.')}
      onConfirm={onConfirm}
      confirmLabel={t('writeOffInvoice', 'Write Off Invoice')}
      errorText={t('errorWritingOffInvoiceTryAgain', 'There was an error writing off this invoice. Please check your connection and try again in a few seconds.')}
    />
  )
}

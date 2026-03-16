import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { Invoice } from '@schemas/invoices/invoice'
import { useVoidInvoice } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/void/useVoidInvoice'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type InvoiceVoidModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoiceId: string
  onSuccess: (invoice: Invoice) => void
}

export function InvoiceVoidModal({ isOpen, onOpenChange, invoiceId, onSuccess }: InvoiceVoidModalProps) {
  const { t } = useTranslation()
  const { trigger: voidInvoice } = useVoidInvoice({ invoiceId })

  const onConfirm = useCallback(async () => {
    const { data: invoice } = await voidInvoice()
    onSuccess(invoice)
  }, [onSuccess, voidInvoice])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('invoices:voidInvoice', 'Void invoice')}
      description={t('invoices:voidingThisInvoiceWillMarkItAsCancelledAndYouWillNoLongerBeAbleToApplyPaymentsToItThisActionCannotBeUndone', 'Voiding this invoice will mark it as cancelled, and you will no longer be able to apply payments to it. This action cannot be undone.')}
      onConfirm={onConfirm}
      confirmLabel={t('invoices:voidInvoiceButton', 'Void Invoice')}
      errorText={t('invoices:errorVoidingInvoiceTryAgain', 'There was an error voiding this invoice. Please check your connection and try again in a few seconds.')}
    />
  )
}

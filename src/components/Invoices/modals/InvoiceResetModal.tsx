import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { useResetInvoice } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/reset/useResetInvoice'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type InvoiceResetModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoice: Invoice
  onSuccess: (invoice: Invoice) => void
}

export function InvoiceResetModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceResetModalProps) {
  const { t } = useTranslation()
  const { trigger: resetInvoice } = useResetInvoice({ invoiceId: invoice.id })

  const onConfirm = useCallback(async () => {
    const { data: updatedInvoice } = await resetInvoice()
    onSuccess(updatedInvoice)
  }, [onSuccess, resetInvoice])

  const description = invoice.status === InvoiceStatus.Voided
    ? t('invoices.resettingThisInvoiceWillRemoveItsCurrentStatusAsVoidAndReturnItToASentState', 'Resetting this invoice will remove its current status as void and return it to a sent state.')
    : t('invoices.resettingThisInvoiceWillDeleteAllPaymentsRefundsAndWriteOffsAssociatedWithItAndReturnItToASentState', 'Resetting this invoice will delete all payments, refunds, and write offs associated with it and return it to a sent state.')

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('invoices.resetInvoiceToSent', 'Reset invoice to sent')}
      description={description}
      onConfirm={onConfirm}
      confirmLabel={t('invoices.resetInvoice', 'Reset Invoice')}
      errorText={t('invoices.errorResettingInvoiceTryAgain', 'There was an error resetting this invoice. Please check your connection and try again in a few seconds.')}
    />
  )
}

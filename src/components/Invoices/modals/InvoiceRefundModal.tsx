import { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { Invoice } from '@schemas/invoices/invoice'
import { updateInvoiceWithRefund } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/refund/useRefundInvoice'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { InvoiceRefundForm } from '@components/Invoices/InvoiceRefundForm/InvoiceRefundForm'

type InvoiceRefundModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  invoice: Invoice
  onSuccess: (invoice: Invoice) => void
}
export function InvoiceRefundModal({ isOpen, onOpenChange, invoice, onSuccess }: InvoiceRefundModalProps) {
  const { t } = useTranslation()
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
      title={t('invoices:label.refund_invoice', 'Issue refund')}
      content={content}
      onConfirm={onConfirm}
      confirmLabel={t('invoices:action.refund_invoice', 'Refund Invoice')}
      errorText={t('invoices:error.refund_invoice', 'There was an error issuing a refund for this invoice. Please check your connection and try again in a few seconds.')}
      closeOnConfirm={false}
    />
  )
}

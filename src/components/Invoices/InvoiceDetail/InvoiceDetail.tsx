import { useCallback, useRef, useState } from 'react'

import { InvoiceDetailStep, useInvoiceDetail, useInvoiceNavigation } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import X from '@icons/X'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { DiscardInvoiceChangesModal } from '@components/Invoices/InvoiceDetail/DiscardInvoiceChangesModal'
import { InvoiceDetailHeader } from '@components/Invoices/InvoiceDetail/InvoiceDetailHeader'
import { InvoiceDetailSubHeader } from '@components/Invoices/InvoiceDetail/InvoiceDetailSubHeader'
import { InvoicePaymentDrawer } from '@components/Invoices/InvoiceDetail/InvoicePaymentDrawer'
import type { InvoiceFormState } from '@components/Invoices/InvoiceForm/formUtils'
import { InvoiceForm } from '@components/Invoices/InvoiceForm/InvoiceForm'
import { InvoicePreview } from '@components/Invoices/InvoicePreview/InvoicePreview'
import { UpsertInvoiceMode } from '@features/invoices/api/useUpsertInvoice'
import { type Invoice } from '@features/invoices/invoiceSchemas'

import './invoiceDetail.scss'

export const InvoiceDetail = () => {
  const viewState = useInvoiceDetail()
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false)
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false)
  const { toInvoiceTable, toPreviewInvoice, toEditInvoice } = useInvoiceNavigation()
  const invoiceFormRef = useRef<{ submit: () => Promise<void> }>(null)

  const onUpsertInvoiceSuccess = useCallback((invoice: Invoice) => {
    toPreviewInvoice(invoice)
  }, [toPreviewInvoice])

  const onSubmitInvoiceForm = useCallback(() => invoiceFormRef.current?.submit(), [])
  const [formState, setFormState] = useState<InvoiceFormState>({
    isDirty: false,
    isSubmitting: false,
  })

  const onChangeFormState = useCallback((nextState: InvoiceFormState) => {
    setFormState(nextState)
  }, [])

  const Header = useCallback(() => {
    return (
      <InvoiceDetailHeader
        formState={formState}
        onSubmitInvoiceForm={onSubmitInvoiceForm}
        openInvoicePaymentDrawer={() => setIsPaymentDrawerOpen(true)}
      />
    )
  }, [onSubmitInvoiceForm, formState])

  const showInvoiceForm = viewState.step === InvoiceDetailStep.Form
  const showInvoicePreview = viewState.step === InvoiceDetailStep.Preview

  const invoiceFormHasChanges = showInvoiceForm && !viewState.isReadOnly && formState.isDirty

  const onGoBack = useCallback(() => {
    if (invoiceFormHasChanges) {
      setIsDiscardChangesModalOpen(true)
    }
    else if (showInvoiceForm) {
      toInvoiceTable()
    }
    else {
      toEditInvoice(viewState.invoice)
    }
  }, [invoiceFormHasChanges, showInvoiceForm, toInvoiceTable, toEditInvoice, viewState])

  return (
    <>
      <BaseDetailView slots={{ Header, BackIcon: invoiceFormHasChanges ? X : BackArrow }} name='InvoiceDetail' onGoBack={onGoBack}>
        {viewState.mode === UpsertInvoiceMode.Update && <InvoiceDetailSubHeader invoice={viewState.invoice} />}
        {showInvoiceForm && (
          <InvoiceForm
            onSuccess={onUpsertInvoiceSuccess}
            onChangeFormState={onChangeFormState}
            ref={invoiceFormRef}
          />
        )}
        {showInvoicePreview && <InvoicePreview />}
      </BaseDetailView>
      <DiscardInvoiceChangesModal
        isOpen={isDiscardChangesModalOpen}
        onOpenChange={setIsDiscardChangesModalOpen}
        onConfirm={toInvoiceTable}
      />
      {viewState.mode === UpsertInvoiceMode.Update && (
        <InvoicePaymentDrawer
          isOpen={isPaymentDrawerOpen}
          onOpenChange={setIsPaymentDrawerOpen}
          invoice={viewState.invoice}
        />
      )}
    </>
  )
}

import { useCallback, useRef, useState } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { InvoiceDetailStep, useInvoiceDetail, useInvoiceNavigation } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { DiscardInvoiceChangesModal } from '@features/invoices/DiscardInvoiceChangesModal/DiscardInvoiceChangesModal'
import { InvoiceDetailHeader } from '@features/invoices/InvoiceDetailHeader/InvoiceDetailHeader'
import { InvoiceDetailSubHeader } from '@features/invoices/InvoiceDetailSubHeader/InvoiceDetailSubHeader'
import { InvoiceFinalizeStep } from '@features/invoices/InvoiceFinalizeStep/InvoiceFinalizeStep'
import type { InvoiceFormState } from '@features/invoices/InvoiceForm/formUtils'
import { InvoiceForm } from '@features/invoices/InvoiceForm/InvoiceForm'
import { InvoicePaymentDrawer } from '@features/invoices/InvoicePaymentDrawer/InvoicePaymentDrawer'

import './invoiceDetail.scss'

export const InvoiceDetail = () => {
  const { t } = useTranslation()
  const viewState = useInvoiceDetail()
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false)
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false)
  const { toInvoiceTable, toPreviewInvoice, toEditInvoice, toViewInvoice } = useInvoiceNavigation()
  const { addToast, accountingConfiguration } = useLayerContext()
  const enablePaymentMethodsOnFinalize = !!accountingConfiguration?.enableStripeOnboarding
  const invoiceFormRef = useRef<{ submit: () => Promise<void> }>(null)

  const onUpsertInvoiceSuccess = useCallback((invoice: Invoice) => {
    if (!enablePaymentMethodsOnFinalize) {
      addToast({
        content: t('invoices:label.invoice_saved', 'Invoice saved'),
        type: 'success',
      })
    }
    toPreviewInvoice(invoice)
  }, [addToast, enablePaymentMethodsOnFinalize, t, toPreviewInvoice])

  const onSubmitInvoiceForm = useCallback(() => invoiceFormRef.current?.submit(), [])
  const [formState, setFormState] = useState<InvoiceFormState>({
    isDirty: false,
    isSubmitting: false,
  })

  const onChangeFormState = useCallback((nextState: InvoiceFormState) => {
    setFormState(nextState)
  }, [])

  const onFinalizeInvoiceSuccess = useCallback((invoice: Invoice) => {
    addToast({
      content: t('invoices:label.invoice_saved_and_sent_successfully', 'Invoice saved and sent successfully'),
      type: 'success',
    })
    toViewInvoice(invoice)
  }, [addToast, t, toViewInvoice])

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
      <BaseDetailView slots={{ Header, BackIcon: invoiceFormHasChanges ? X : ChevronLeft }} name='InvoiceDetail' onGoBack={onGoBack}>
        {viewState.mode === UpsertMode.Update && <InvoiceDetailSubHeader invoice={viewState.invoice} />}
        {showInvoiceForm && (
          <InvoiceForm
            onSuccess={onUpsertInvoiceSuccess}
            onChangeFormState={onChangeFormState}
            ref={invoiceFormRef}
          />
        )}
        {showInvoicePreview && (
          <InvoiceFinalizeStep onSuccess={onFinalizeInvoiceSuccess} />
        )}
      </BaseDetailView>
      <DiscardInvoiceChangesModal
        isOpen={isDiscardChangesModalOpen}
        onOpenChange={setIsDiscardChangesModalOpen}
        onConfirm={toInvoiceTable}
      />
      {viewState.mode === UpsertMode.Update && (
        <InvoicePaymentDrawer
          isOpen={isPaymentDrawerOpen}
          onOpenChange={setIsPaymentDrawerOpen}
          invoice={viewState.invoice}
        />
      )}
    </>
  )
}

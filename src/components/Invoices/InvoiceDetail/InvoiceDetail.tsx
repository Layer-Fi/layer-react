import { useCallback, useRef, useState } from 'react'

import { useInvoiceDetail, useInvoiceNavigation } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import BackArrow from '@icons/BackArrow'
import X from '@icons/X'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { DiscardInvoiceChangesModal } from '@components/Invoices/InvoiceDetail/DiscardInvoiceChangesModal'
import { InvoiceDetailHeader } from '@components/Invoices/InvoiceDetail/InvoiceDetailHeader'
import { InvoiceDetailSubHeader } from '@components/Invoices/InvoiceDetail/InvoiceDetailSubHeader'
import { InvoicePaymentDrawer } from '@components/Invoices/InvoiceDetail/InvoicePaymentDrawer'
import type { InvoiceFormState } from '@components/Invoices/InvoiceForm/formUtils'
import { InvoiceForm } from '@components/Invoices/InvoiceForm/InvoiceForm'
import { useInvoicePaymentMethods } from '@features/invoices/api/useInvoicePaymentMethods'
import { UpsertInvoiceMode } from '@features/invoices/api/useUpsertInvoice'
import { type Invoice, InvoiceFormStep } from '@features/invoices/invoiceSchemas'

import './invoiceDetail.scss'

export const InvoiceDetail = () => {
  const viewState = useInvoiceDetail()
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false)
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false)
  const { toViewInvoice, toInvoiceTable } = useInvoiceNavigation()
  const { addToast } = useLayerContext()
  const formRef = useRef<{
    submit: ({ submitAction }: { submitAction: 'send' | null }) => Promise<void>
    goToPreviousStep: () => void
    goToNextStep: () => boolean
    currentStep: InvoiceFormStep
  }>(null)

  const invoiceId = viewState.mode === UpsertInvoiceMode.Update ? viewState.invoice.id : null
  const { data: paymentMethodsData, isLoading: isLoadingPaymentMethods } = useInvoicePaymentMethods({ invoiceId })

  const paymentMethodsLoaded = !invoiceId || (!isLoadingPaymentMethods && paymentMethodsData !== undefined)

  const [currentStep, setCurrentStep] = useState<InvoiceFormStep>(InvoiceFormStep.Details)

  const [isReadOnly, setIsReadOnly] = useState(viewState.mode === UpsertInvoiceMode.Update)

  const onUpsertInvoiceSuccess = useCallback((invoice: Invoice) => {
    const toastContent = viewState.mode === UpsertInvoiceMode.Update
      ? 'Invoice updated successfully'
      : 'Invoice created successfully'
    addToast({ content: toastContent, type: 'success' })

    toViewInvoice(invoice)
    setIsReadOnly(true)
  }, [viewState.mode, addToast, toViewInvoice])

  const onSubmit = useCallback(({ submitAction }: { submitAction: 'send' | null }) => formRef.current?.submit({ submitAction }), [])
  const [formState, setFormState] = useState<InvoiceFormState>({
    isDirty: false,
    isSubmitting: false,
    hasActualChanges: false,
  })

  const onChangeFormState = useCallback((nextState: InvoiceFormState) => {
    setFormState(nextState)
  }, [])

  const onGoToNextStep = useCallback(() => {
    const success = formRef.current?.goToNextStep()
    if (success) {
      setCurrentStep(InvoiceFormStep.PaymentMethods)
    }
  }, [])

  const Header = useCallback(() => {
    return (
      <InvoiceDetailHeader
        onSubmit={onSubmit}
        isReadOnly={isReadOnly}
        formState={formState}
        setIsReadOnly={setIsReadOnly}
        openInvoicePaymentDrawer={() => setIsPaymentDrawerOpen(true)}
        currentStep={currentStep}
        onGoToNextStep={onGoToNextStep}
      />
    )
  }, [onSubmit, isReadOnly, formState, currentStep, onGoToNextStep])

  const hasActualChanges = !isReadOnly && formState.hasActualChanges
  const showXButton = hasActualChanges && currentStep === InvoiceFormStep.Details

  const onGoBack = useCallback(() => {
    if (!isReadOnly && currentStep === InvoiceFormStep.PaymentMethods) {
      formRef.current?.goToPreviousStep()
      setCurrentStep(InvoiceFormStep.Details)
      return
    }

    if (hasActualChanges) {
      setIsDiscardChangesModalOpen(true)
    }
    else {
      toInvoiceTable()
    }
  }, [hasActualChanges, toInvoiceTable, isReadOnly, currentStep])

  return (
    <>
      <BaseDetailView slots={{ Header, BackIcon: showXButton ? X : BackArrow }} name='InvoiceDetail' onGoBack={onGoBack}>
        {viewState.mode === UpsertInvoiceMode.Update && <InvoiceDetailSubHeader invoice={viewState.invoice} />}
        <InvoiceForm
          key={paymentMethodsLoaded ? 'loaded' : 'loading'}
          isReadOnly={isReadOnly}
          onSuccess={onUpsertInvoiceSuccess}
          onChangeFormState={onChangeFormState}
          initialPaymentMethods={paymentMethodsData?.data}
          ref={formRef}
        />
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

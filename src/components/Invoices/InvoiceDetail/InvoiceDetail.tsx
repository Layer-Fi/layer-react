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
  const {
    data: paymentMethodsData,
    isLoading: isLoadingPaymentMethods,
    isError: isPaymentMethodsError,
  } = useInvoicePaymentMethods({ invoiceId })

  const paymentMethodsLoaded = !invoiceId || (!isLoadingPaymentMethods && !isPaymentMethodsError && paymentMethodsData !== undefined)

  const [currentStep, setCurrentStep] = useState<InvoiceFormStep>(InvoiceFormStep.Details)

  const [isReadOnly, setIsReadOnly] = useState(viewState.mode === UpsertInvoiceMode.Update)

  const onUpsertInvoiceSuccess = useCallback((invoice: Invoice) => {
    const toastContent = viewState.mode === UpsertInvoiceMode.Update
      ? 'Invoice updated successfully'
      : 'Invoice created successfully'
    addToast({ content: toastContent, type: 'success' })

    formRef.current?.goToPreviousStep()
    setCurrentStep(InvoiceFormStep.Details)
    toViewInvoice(invoice)
    setIsReadOnly(true)
  }, [viewState.mode, addToast, toViewInvoice])

  const onSubmit = useCallback(({ submitAction }: { submitAction: 'send' | null }) => formRef.current?.submit({ submitAction }), [])
  const [formState, setFormState] = useState<InvoiceFormState>({
    isDirty: false,
    isSubmitting: false,
    hasChanges: false,
  })

  const onChangeFormState = useCallback((nextState: InvoiceFormState) => {
    setFormState(nextState)
  }, [])

  const onNextStep = useCallback(() => {
    formRef.current?.goToNextStep()
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
        onNextStep={onNextStep}
      />
    )
  }, [onSubmit, isReadOnly, formState, currentStep, onNextStep])

  const hasChanges = !isReadOnly && formState.hasChanges
  const showXButton = hasChanges && currentStep === InvoiceFormStep.Details

  const onBack = useCallback(() => {
    if (!isReadOnly && currentStep === InvoiceFormStep.PaymentMethods) {
      formRef.current?.goToPreviousStep()
      setCurrentStep(InvoiceFormStep.Details)
      return
    }

    if (hasChanges) {
      setIsDiscardChangesModalOpen(true)
    }
    else {
      toInvoiceTable()
    }
  }, [hasChanges, toInvoiceTable, isReadOnly, currentStep])

  return (
    <>
      <BaseDetailView slots={{ Header, BackIcon: showXButton ? X : BackArrow }} name='InvoiceDetail' onBack={onBack}>
        {viewState.mode === UpsertInvoiceMode.Update && <InvoiceDetailSubHeader invoice={viewState.invoice} />}
        <InvoiceForm
          isReadOnly={isReadOnly}
          onSuccess={onUpsertInvoiceSuccess}
          onChangeFormState={onChangeFormState}
          onStepChange={setCurrentStep}
          paymentMethodsLoaded={paymentMethodsLoaded}
          paymentMethodsIsLoading={isLoadingPaymentMethods}
          paymentMethodsIsError={isPaymentMethodsError}
          initialPaymentMethods={paymentMethodsData?.data.paymentMethods}
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

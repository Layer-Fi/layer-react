import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo } from 'react'
import type React from 'react'

import { useAccountingConfiguration } from '@hooks/useAccountingConfiguration/useAccountingConfiguration'
import { useInvoiceDetail } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { CustomerFormDrawer } from '@components/CustomerForm/CustomerFormDrawer'
import { type InvoiceFormState } from '@components/Invoices/InvoiceForm/formUtils'
import { InvoiceFormContextProvider } from '@components/Invoices/InvoiceForm/InvoiceFormContext'
import { InvoiceFormDetailsStep } from '@components/Invoices/InvoiceForm/InvoiceFormDetailsStep/InvoiceFormDetailsStep'
import { InvoiceFormErrorBanner } from '@components/Invoices/InvoiceForm/InvoiceFormErrorBanner/InvoiceFormErrorBanner'
import { InvoiceFormPaymentMethodsStep } from '@components/Invoices/InvoiceForm/InvoiceFormPaymentMethodsStep/InvoiceFormPaymentMethodsStep'
import { useCustomerFormDrawer } from '@components/Invoices/InvoiceForm/useCustomerFormDrawer'
import { useInvoiceForm } from '@components/Invoices/InvoiceForm/useInvoiceForm'
import { type InvoicePaymentMethodType } from '@features/invoices/api/useInvoicePaymentMethods'
import { UpsertInvoiceMode } from '@features/invoices/api/useUpsertInvoice'
import { type Invoice, InvoiceFormStep } from '@features/invoices/invoiceSchemas'

import './invoiceForm.scss'

export type InvoiceFormMode = { mode: UpsertInvoiceMode.Update, invoice: Invoice } | { mode: UpsertInvoiceMode.Create }
export type InvoiceFormProps = {
  isReadOnly: boolean
  onSuccess: (invoice: Invoice) => void
  onChangeFormState?: (formState: InvoiceFormState) => void
  onStepChange?: (step: InvoiceFormStep) => void
  initialPaymentMethods?: readonly InvoicePaymentMethodType[]
  paymentMethodsLoaded: boolean
  paymentMethodsIsLoading?: boolean
  paymentMethodsIsError?: boolean
}

export const InvoiceForm = forwardRef((props: InvoiceFormProps, ref) => {
  const viewState: InvoiceFormMode = useInvoiceDetail()
  const { mode } = viewState

  const {
    onSuccess,
    onChangeFormState,
    onStepChange,
    isReadOnly,
    initialPaymentMethods,
    paymentMethodsLoaded,
    paymentMethodsIsLoading = false,
    paymentMethodsIsError = false,
  } = props
  const { businessId } = useLayerContext()
  const { data: accountingConfig } = useAccountingConfiguration({ businessId })
  const enableCustomerManagement = accountingConfig?.enableCustomerManagement ?? false

  const {
    form,
    formState,
    totals,
    submitError,
    currentStep,
    goToPreviousStep,
    goToNextStep,
  } = useInvoiceForm(
    {
      onSuccess,
      initialPaymentMethods,
      paymentMethodsLoaded,
      ...viewState,
    },
  )

  const initialDueAt = mode === UpsertInvoiceMode.Update ? viewState.invoice.dueAt : null

  const {
    formState: customerFormState,
    isOpen: isCustomerDrawerOpen,
    editCustomer,
    createCustomer,
    onOpenChange: onCustomerDrawerOpenChange,
    onSuccess: onCustomerDrawerSuccess,
  } = useCustomerFormDrawer(form)

  // Prevents default browser form submission behavior since we're handling submission externally
  // via a custom handler (e.g., onClick). This ensures accidental native submits (like pressing
  // Enter or using a <button type="submit">) don’t trigger unexpected behavior.
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useImperativeHandle(ref, () => ({
    submit: ({ submitAction }: { submitAction: 'send' | null }) => form.handleSubmit({ submitAction }),
    goToPreviousStep,
    goToNextStep,
    currentStep,
  }), [form, goToPreviousStep, goToNextStep, currentStep])

  useEffect(() => {
    onChangeFormState?.(formState)
  }, [formState, onChangeFormState])

  useEffect(() => {
    onStepChange?.(currentStep)
  }, [currentStep, onStepChange])

  const contextValue = useMemo(() => ({
    form,
    isReadOnly,
    totals,
    enableCustomerManagement,
    initialDueAt,
    onClickEditCustomer: editCustomer,
    onClickCreateNewCustomer: createCustomer,
    paymentMethodsIsLoading,
    paymentMethodsIsError,
  }), [
    form,
    isReadOnly,
    totals,
    enableCustomerManagement,
    initialDueAt,
    editCustomer,
    createCustomer,
    paymentMethodsIsLoading,
    paymentMethodsIsError,
  ])

  return (
    <InvoiceFormContextProvider value={contextValue}>
      <>
        <Form className='Layer__InvoiceForm' onSubmit={blockNativeOnSubmit}>
          <InvoiceFormErrorBanner form={form} submitError={submitError} />

          {currentStep === InvoiceFormStep.Details && <InvoiceFormDetailsStep />}

          {currentStep === InvoiceFormStep.PaymentMethods && (
            <HStack className='Layer__InvoiceForm__PaymentMethodsLayout' gap='lg'>
              <VStack className='Layer__InvoiceForm__PreviewSection' align='center' justify='center'>
                <VStack className='Layer__InvoiceForm__PreviewPlaceholder' align='center' justify='center'>
                  {/* Invoice PDF preview will be added here */}
                </VStack>
              </VStack>
              <InvoiceFormPaymentMethodsStep />
            </HStack>
          )}
        </Form>
        {enableCustomerManagement && (
          <CustomerFormDrawer
            isOpen={isCustomerDrawerOpen}
            onOpenChange={onCustomerDrawerOpenChange}
            onSuccess={onCustomerDrawerSuccess}
            formState={customerFormState}
          />
        )}
      </>
    </InvoiceFormContextProvider>
  )
})
InvoiceForm.displayName = 'InvoiceForm'

import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'
import type React from 'react'

import { useAccountingConfiguration } from '@hooks/useAccountingConfiguration/useAccountingConfiguration'
import { useInvoiceDetail } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { CustomerFormDrawer } from '@components/CustomerForm/CustomerFormDrawer'
import { type InvoiceFormState } from '@components/Invoices/InvoiceForm/formUtils'
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
  initialPaymentMethods?: readonly InvoicePaymentMethodType[]
}

export const InvoiceForm = forwardRef((props: InvoiceFormProps, ref) => {
  const viewState: InvoiceFormMode = useInvoiceDetail()
  const { mode } = viewState

  const { onSuccess, onChangeFormState, isReadOnly, initialPaymentMethods } = props
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
    { onSuccess, initialPaymentMethods, ...viewState },
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
  }))

  useEffect(() => {
    onChangeFormState?.(formState)
  }, [formState, onChangeFormState])

  return (
    <>
      <Form className='Layer__InvoiceForm' onSubmit={blockNativeOnSubmit}>
        <InvoiceFormErrorBanner form={form} submitError={submitError} />

        {currentStep === InvoiceFormStep.Details && (
          <InvoiceFormDetailsStep
            form={form}
            isReadOnly={isReadOnly}
            totals={totals}
            enableCustomerManagement={enableCustomerManagement}
            initialDueAt={initialDueAt}
            onClickEditCustomer={editCustomer}
            onClickCreateNewCustomer={createCustomer}
          />
        )}

        {currentStep === InvoiceFormStep.PaymentMethods && (
          <HStack className='Layer__InvoiceForm__PaymentMethodsLayout' gap='lg'>
            <VStack className='Layer__InvoiceForm__PreviewSection' align='center' justify='center'>
              <VStack className='Layer__InvoiceForm__PreviewPlaceholder' align='center' justify='center'>
                {/* Invoice PDF preview will be added here */}
              </VStack>
            </VStack>
            <InvoiceFormPaymentMethodsStep
              form={form}
              isReadOnly={isReadOnly}
            />
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
  )
})
InvoiceForm.displayName = 'InvoiceForm'

import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'
import type React from 'react'

import { useAccountingConfiguration } from '@hooks/useAccountingConfiguration/useAccountingConfiguration'
import { useInvoiceDetail } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Form } from '@ui/Form/Form'
import { VStack } from '@ui/Stack/Stack'
import { CustomerFormDrawer } from '@components/CustomerForm/CustomerFormDrawer'
import { type InvoiceFormState } from '@components/Invoices/InvoiceForm/formUtils'
import { InvoiceFormErrorBanner } from '@components/Invoices/InvoiceForm/InvoiceFormErrorBanner/InvoiceFormErrorBanner'
import { InvoiceFormLineItemsSection } from '@components/Invoices/InvoiceForm/InvoiceFormLineItemsSection/InvoiceFormLineItemsSection'
import { InvoiceFormMetadataSection } from '@components/Invoices/InvoiceForm/InvoiceFormMetadataSection/InvoiceFormMetadataSection'
import { InvoiceFormTermsSection } from '@components/Invoices/InvoiceForm/InvoiceFormTermsSection/InvoiceFormTermsSection'
import { useCustomerFormDrawer } from '@components/Invoices/InvoiceForm/useCustomerFormDrawer'
import { useInvoiceForm } from '@components/Invoices/InvoiceForm/useInvoiceForm'
import { UpsertInvoiceMode } from '@features/invoices/api/useUpsertInvoice'
import type { Invoice } from '@features/invoices/invoiceSchemas'

import './invoiceForm.scss'

export type InvoiceFormProps = {
  onSuccess: (invoice: Invoice) => void
  onChangeFormState?: (formState: InvoiceFormState) => void
}

export const InvoiceForm = forwardRef((props: InvoiceFormProps, ref) => {
  const { isReadOnly, ...viewState } = useInvoiceDetail()
  const { mode } = viewState

  const { onSuccess, onChangeFormState } = props
  const { businessId } = useLayerContext()
  const { data: accountingConfig } = useAccountingConfiguration({ businessId })
  const enableCustomerManagement = accountingConfig?.enableCustomerManagement ?? false

  const { form, formState, totals, submitError } = useInvoiceForm(
    { onSuccess, ...viewState },
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
    submit: () => form.handleSubmit(),
  }))

  useEffect(() => {
    onChangeFormState?.(formState)
  }, [formState, onChangeFormState])

  return (
    <>
      <Form className='Layer__InvoiceForm' onSubmit={blockNativeOnSubmit}>
        <form.AppForm>
          <InvoiceFormErrorBanner submitError={submitError} />
        </form.AppForm>
        <InvoiceFormTermsSection
          form={form}
          enableCustomerManagement={enableCustomerManagement}
          initialDueAt={initialDueAt}
          onClickEditCustomer={editCustomer}
          onClickCreateNewCustomer={createCustomer}
        />
        <VStack className='Layer__InvoiceForm__Body' gap='md'>
          <InvoiceFormLineItemsSection form={form} />
          <InvoiceFormMetadataSection form={form} totals={totals} />
        </VStack>
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

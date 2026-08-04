import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'
import type React from 'react'

import type { Invoice } from '@schemas/invoices/invoice'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useInvoiceDetail } from '@providers/invoices/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Form } from '@ui/Form/Form'
import { VStack } from '@ui/Stack/Stack'
import { CustomerFormDrawer } from '@features/customerVendor/CustomerFormDrawer/CustomerFormDrawer'
import { type InvoiceFormState } from '@features/invoices/InvoiceForm/formUtils'
import { InvoiceFormErrorBanner } from '@features/invoices/InvoiceForm/InvoiceFormErrorBanner'
import { InvoiceFormLineItemsSection } from '@features/invoices/InvoiceForm/InvoiceFormLineItemsSection'
import { InvoiceFormMetadataSection } from '@features/invoices/InvoiceForm/InvoiceFormMetadataSection'
import { InvoiceFormTermsSection } from '@features/invoices/InvoiceForm/InvoiceFormTermsSection'
import { useCustomerFormDrawer } from '@features/invoices/InvoiceForm/useCustomerFormDrawer'
import { useInvoiceForm } from '@features/invoices/InvoiceForm/useInvoiceForm'

import './invoiceForm.scss'

export type InvoiceFormProps = {
  onSuccess: (invoice: Invoice) => void
  onChangeFormState?: (formState: InvoiceFormState) => void
}

export const InvoiceForm = forwardRef((props: InvoiceFormProps, ref) => {
  const { isReadOnly, ...viewState } = useInvoiceDetail()
  const { mode } = viewState

  const { onSuccess, onChangeFormState } = props
  const { accountingConfiguration } = useLayerContext()
  const enableCustomerManagement = accountingConfiguration?.enableCustomerManagement === true

  const { form, formState, totals, submitError } = useInvoiceForm(
    { onSuccess, ...viewState },
  )

  const initialDueAt = mode === UpsertMode.Update ? viewState.invoice.dueAt : null

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

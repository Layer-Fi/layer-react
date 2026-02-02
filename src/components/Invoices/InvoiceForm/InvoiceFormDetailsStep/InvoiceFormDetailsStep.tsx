import { VStack } from '@ui/Stack/Stack'
import { useInvoiceFormContext } from '@components/Invoices/InvoiceForm/InvoiceFormContext'
import { InvoiceFormLineItemsSection } from '@components/Invoices/InvoiceForm/InvoiceFormLineItemsSection/InvoiceFormLineItemsSection'
import { InvoiceFormMetadataSection } from '@components/Invoices/InvoiceForm/InvoiceFormMetadataSection/InvoiceFormMetadataSection'
import { InvoiceFormTermsSection } from '@components/Invoices/InvoiceForm/InvoiceFormTermsSection/InvoiceFormTermsSection'

export const InvoiceFormDetailsStep = () => {
  const {
    form,
    isReadOnly,
    totals,
    enableCustomerManagement,
    initialDueAt,
    onClickEditCustomer,
    onClickCreateNewCustomer,
  } = useInvoiceFormContext()

  return (
    <>
      <InvoiceFormTermsSection
        form={form}
        isReadOnly={isReadOnly}
        enableCustomerManagement={enableCustomerManagement}
        initialDueAt={initialDueAt}
        onClickEditCustomer={onClickEditCustomer}
        onClickCreateNewCustomer={onClickCreateNewCustomer}
      />
      <VStack className='Layer__InvoiceForm__Body' gap='md'>
        <InvoiceFormLineItemsSection form={form} isReadOnly={isReadOnly} />
        <InvoiceFormMetadataSection form={form} isReadOnly={isReadOnly} totals={totals} />
      </VStack>
    </>
  )
}

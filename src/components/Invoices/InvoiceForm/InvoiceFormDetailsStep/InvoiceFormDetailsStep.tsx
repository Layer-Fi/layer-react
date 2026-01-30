import { type BigDecimal as BD } from 'effect'

import { VStack } from '@ui/Stack/Stack'
import { InvoiceFormLineItemsSection } from '@components/Invoices/InvoiceForm/InvoiceFormLineItemsSection/InvoiceFormLineItemsSection'
import { InvoiceFormMetadataSection } from '@components/Invoices/InvoiceForm/InvoiceFormMetadataSection/InvoiceFormMetadataSection'
import { InvoiceFormTermsSection } from '@components/Invoices/InvoiceForm/InvoiceFormTermsSection/InvoiceFormTermsSection'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'

type InvoiceFormDetailsStepProps = {
  form: InvoiceFormType
  isReadOnly: boolean
  totals: {
    subtotal: BD.BigDecimal
    additionalDiscount: BD.BigDecimal
    taxableSubtotal: BD.BigDecimal
    taxes: BD.BigDecimal
    grandTotal: BD.BigDecimal
  }
  enableCustomerManagement: boolean
  initialDueAt: Date | null
  onClickEditCustomer: () => void
  onClickCreateNewCustomer: (inputValue: string) => void
}

export const InvoiceFormDetailsStep = ({
  form,
  isReadOnly,
  totals,
  enableCustomerManagement,
  initialDueAt,
  onClickEditCustomer,
  onClickCreateNewCustomer,
}: InvoiceFormDetailsStepProps) => {
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

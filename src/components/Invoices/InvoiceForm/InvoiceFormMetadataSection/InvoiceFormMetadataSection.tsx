import { useTranslation } from 'react-i18next'

import { negateNonRecursiveBigDecimal, type NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import { useInvoiceDetail } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { InvoiceFormTotalRow } from '@components/Invoices/InvoiceForm/InvoiceFormTotalRow/InvoiceFormTotalRow'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'

import './invoiceFormMetadataSection.scss'

type InvoiceFormMetadataSectionProps = {
  form: InvoiceFormType
  totals: {
    subtotal: NonRecursiveBigDecimal
    additionalDiscount: NonRecursiveBigDecimal
    taxableSubtotal: NonRecursiveBigDecimal
    taxes: NonRecursiveBigDecimal
    grandTotal: NonRecursiveBigDecimal
  }
}

export const InvoiceFormMetadataSection = ({
  form,
  totals,
}: InvoiceFormMetadataSectionProps) => {
  const { t } = useTranslation()
  const { isReadOnly } = useInvoiceDetail()
  const { subtotal, additionalDiscount, taxableSubtotal, taxes, grandTotal } = totals

  return (
    <VStack className='Layer__InvoiceForm__Metadata' pbs='md'>
      <HStack justify='space-between' gap='xl'>
        <VStack className='Layer__InvoiceForm__AdditionalTextFields'>
          <form.AppField name='memo'>
            {field => <field.FormTextAreaField label={t('common:label.memo', 'Memo')} isReadOnly={isReadOnly} />}
          </form.AppField>
        </VStack>
        <VStack className='Layer__InvoiceForm__TotalFields' fluid>
          <InvoiceFormTotalRow label={t('invoices:label.subtotal', 'Subtotal')} value={subtotal} />
          <InvoiceFormTotalRow label={t('invoices:label.discount', 'Discount')} value={negateNonRecursiveBigDecimal(additionalDiscount)}>
            <form.AppField name='discountRate'>
              {field => <field.FormNonRecursiveBigDecimalField label={t('invoices:label.discount', 'Discount')} showLabel={false} mode='percent' isReadOnly={isReadOnly} />}
            </form.AppField>
          </InvoiceFormTotalRow>
          <InvoiceFormTotalRow label={t('invoices:label.taxable_subtotal', 'Taxable subtotal')} value={taxableSubtotal} />
          <InvoiceFormTotalRow label={t('invoices:label.tax_rate', 'Tax rate')} value={taxes}>
            <form.AppField name='taxRate'>
              {field => <field.FormNonRecursiveBigDecimalField label={t('invoices:label.tax_rate_title_case', 'Tax Rate')} showLabel={false} mode='percent' isReadOnly={isReadOnly} />}
            </form.AppField>
          </InvoiceFormTotalRow>
          <InvoiceFormTotalRow label={t('common:label.total', 'Total')} value={grandTotal} />
        </VStack>
      </HStack>
    </VStack>
  )
}

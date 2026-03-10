import { type BigDecimal as BD } from 'effect'
import { useTranslation } from 'react-i18next'

import { negate } from '@utils/bigDecimalUtils'
import { useInvoiceDetail } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { InvoiceFormTotalRow } from '@components/Invoices/InvoiceForm/InvoiceFormTotalRow/InvoiceFormTotalRow'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'

import './invoiceFormMetadataSection.scss'

type InvoiceFormMetadataSectionProps = {
  form: InvoiceFormType
  totals: {
    subtotal: BD.BigDecimal
    additionalDiscount: BD.BigDecimal
    taxableSubtotal: BD.BigDecimal
    taxes: BD.BigDecimal
    grandTotal: BD.BigDecimal
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
            {field => <field.FormTextAreaField label={t('memo', 'Memo')} isReadOnly={isReadOnly} />}
          </form.AppField>
        </VStack>
        <VStack className='Layer__InvoiceForm__TotalFields' fluid>
          <InvoiceFormTotalRow label={t('subtotal', 'Subtotal')} value={subtotal} />
          <InvoiceFormTotalRow label={t('discount', 'Discount')} value={negate(additionalDiscount)}>
            <form.AppField name='discountRate'>
              {field => <field.FormBigDecimalField label={t('discount', 'Discount')} showLabel={false} mode='percent' isReadOnly={isReadOnly} />}
            </form.AppField>
          </InvoiceFormTotalRow>
          <InvoiceFormTotalRow label={t('taxableSubtotal', 'Taxable subtotal')} value={taxableSubtotal} />
          <InvoiceFormTotalRow label={t('taxRate', 'Tax rate')} value={taxes}>
            <form.AppField name='taxRate'>
              {field => <field.FormBigDecimalField label={t('taxRate2', 'Tax Rate')} showLabel={false} mode='percent' isReadOnly={isReadOnly} />}
            </form.AppField>
          </InvoiceFormTotalRow>
          <InvoiceFormTotalRow label={t('total', 'Total')} value={grandTotal} />
        </VStack>
      </HStack>
    </VStack>
  )
}

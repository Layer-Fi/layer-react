import { useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { useAppForm } from '../../../features/forms/hooks/useForm'
import { UpsertInvoiceSchema, type Invoice, type InvoiceLineItem } from '../../../features/invoices/invoiceSchemas'
import { useUpsertInvoice, UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'
import { BigDecimal as BD, Schema } from 'effect'
import { convertBigDecimalToCents, convertCentsToBigDecimal } from '../../../utils/bigDecimalUtils'

export const EMPTY_LINE_ITEM = {
  product: '',
  description: '',
  unitPrice: 0,
  quantity: BD.fromBigInt(1n),
  amount: 0,
  isTaxable: false,
}

const DEFAULT_FORM_VALUES = {
  invoiceNumber: '',
  customer: null,
  email: '',
  address: '',
  lineItems: [EMPTY_LINE_ITEM],
}

const getInvoiceLineItemAmount = (lineItem: InvoiceLineItem): number => {
  const { unitPrice, quantity } = lineItem

  return convertBigDecimalToCents(BD.multiply(quantity, convertCentsToBigDecimal(unitPrice)))
}

const getAugmentedInvoiceFormLineItem = (lineItem: InvoiceLineItem) => {
  return {
    ...lineItem,
    amount: getInvoiceLineItemAmount(lineItem),
    isTaxable: lineItem.salesTaxTotal > 0,
  }
}

const getInvoiceFormDefaultValues = (invoice: Invoice) => ({
  invoiceNumber: invoice.invoiceNumber,
  customer: invoice.customer,
  email: invoice.customer?.email,
  address: invoice.customer?.addressString,
  lineItems: invoice.lineItems.map(getAugmentedInvoiceFormLineItem),
})

 type UseInvoiceFormProps =
   | { onSuccess?: (invoice: Invoice) => void, mode: UpsertInvoiceMode.Create }
   | { onSuccess?: (invoice: Invoice) => void, mode: UpsertInvoiceMode.Update, invoice: Invoice }

export const useInvoiceForm = (props: UseInvoiceFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, mode } = props

  const upsertInvoiceProps = mode === UpsertInvoiceMode.Update ? { mode, invoiceId: props.invoice.id } : { mode }
  const { trigger: upsertInvoice } = useUpsertInvoice(upsertInvoiceProps)

  const defaultValues = mode === UpsertInvoiceMode.Update
    ? getInvoiceFormDefaultValues(props.invoice)
    : DEFAULT_FORM_VALUES

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          ...value,
          customerId: value?.customer?.id,
        }
        const invoiceParams = Schema.validateSync(UpsertInvoiceSchema)(payload)
        const { data: invoice } = await upsertInvoice(invoiceParams)
        setSubmitError(undefined)
        onSuccess?.(invoice)
      }
      catch {
        setSubmitError('Something went wrong. Please try again.')
      }
    },
  })

  const isFormValid = useStore(form.store, state => state.isValid)

  return { form, submitError, isFormValid }
}

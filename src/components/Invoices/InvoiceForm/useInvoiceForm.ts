import { useMemo, useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { useAppForm } from '../../../features/forms/hooks/useForm'
import { UpsertInvoiceSchema, type Invoice, type InvoiceLineItem } from '../../../features/invoices/invoiceSchemas'
import { useUpsertInvoice, UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'
import { BigDecimal as BD, Schema } from 'effect'
import { BIG_DECIMAL_ZERO, BIG_DECIMAL_ONE, convertCentsToBigDecimal, safeDivide } from '../../../utils/bigDecimalUtils'
import {
  computeAdditionalDiscount,
  computeGrandTotal,
  computeRawTaxableSubtotal,
  computeSubtotal,
  computeTaxableSubtotal,
  computeTaxes,
} from './utils'

export const EMPTY_LINE_ITEM = {
  product: '',
  description: '',
  unitPrice: BIG_DECIMAL_ZERO,
  quantity: BIG_DECIMAL_ONE,
  amount: BIG_DECIMAL_ZERO,
  isTaxable: false,
}

const DEFAULT_FORM_VALUES = {
  invoiceNumber: '',
  customer: null,
  email: '',
  address: '',
  lineItems: [EMPTY_LINE_ITEM],
  memo: '',
  discountRate: BIG_DECIMAL_ZERO,
  additionalDiscount: BIG_DECIMAL_ZERO,
  taxRate: BIG_DECIMAL_ZERO,
}

const getInvoiceLineItemAmount = (lineItem: InvoiceLineItem): BD.BigDecimal => {
  const { unitPrice, quantity } = lineItem

  return BD.multiply(quantity, convertCentsToBigDecimal(unitPrice))
}

const getAugmentedInvoiceLineItem = (lineItem: InvoiceLineItem) => {
  return {
    ...lineItem,
    unitPrice: convertCentsToBigDecimal(lineItem.unitPrice),
    amount: getInvoiceLineItemAmount(lineItem),
    isTaxable: lineItem.salesTaxTotal > 0,
  }
}

const getInvoiceFormDefaultValues = (invoice: Invoice) => {
  const augmentedLineItems = invoice.lineItems.map(getAugmentedInvoiceLineItem)

  const subtotal = computeSubtotal(augmentedLineItems)
  const rawTaxableSubtotal = computeRawTaxableSubtotal(augmentedLineItems)

  const additionalDiscount = convertCentsToBigDecimal(invoice.additionalDiscount)
  const discountRate = safeDivide(additionalDiscount, subtotal)

  const taxableSubtotal = computeTaxableSubtotal({ rawTaxableSubtotal, discountRate })

  const taxes = augmentedLineItems.reduce(
    (sum, item) =>
      BD.sum(sum, convertCentsToBigDecimal(item.salesTaxTotal)), BIG_DECIMAL_ZERO)
  const taxRate = safeDivide(taxes, taxableSubtotal)

  return {
    invoiceNumber: invoice.invoiceNumber || '',
    customer: invoice.customer,
    email: invoice.customer?.email || '',
    address: invoice.customer?.addressString || '',
    lineItems: augmentedLineItems,
    discountRate,
    additionalDiscount,
    taxRate,
  }
}

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

  const lineItems = useStore(form.store, state => state.values.lineItems)
  const discountRate = useStore(form.store, state => state.values.discountRate)
  const taxRate = useStore(form.store, state => state.values.taxRate)

  const { subtotal, rawTaxableSubtotal } = useMemo(() => ({
    subtotal: computeSubtotal(lineItems),
    rawTaxableSubtotal: computeRawTaxableSubtotal(lineItems),
  }), [lineItems])

  const additionalDiscount = useMemo(() =>
    computeAdditionalDiscount({ subtotal, discountRate }),
  [subtotal, discountRate],
  )

  const taxableSubtotal = useMemo(() =>
    computeTaxableSubtotal({ rawTaxableSubtotal, discountRate }),
  [rawTaxableSubtotal, discountRate],
  )

  const taxes = useMemo(() =>
    computeTaxes({ taxableSubtotal, taxRate }),
  [taxableSubtotal, taxRate],
  )

  const grandTotal = useMemo(() =>
    computeGrandTotal({ subtotal, additionalDiscount, taxes }),
  [subtotal, additionalDiscount, taxes],
  )

  return { form, subtotal, additionalDiscount, taxableSubtotal, taxes, grandTotal, submitError, isFormValid }
}

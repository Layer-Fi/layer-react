import { useCallback, useMemo, useState, useRef } from 'react'
import { useStore } from '@tanstack/react-form'
import { useAppForm } from '../../../features/forms/hooks/useForm'
import { UpsertInvoiceSchema, type Invoice, type InvoiceForm, type InvoiceFormLineItem, type InvoiceLineItem } from '../../../features/invoices/invoiceSchemas'
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
import { startOfToday } from 'date-fns'
import { getLocalTimeZone, fromDate } from '@internationalized/date'
import { getInvoiceTermsFromDates, InvoiceTermsValues } from '../InvoiceTermsComboBox/InvoiceTermsComboBox'

export const getEmptyLineItem = (): InvoiceFormLineItem => ({
  product: '',
  description: '',
  unitPrice: BIG_DECIMAL_ZERO,
  quantity: BIG_DECIMAL_ONE,
  amount: BIG_DECIMAL_ZERO,
  isTaxable: false,
})

const getInvoiceFormDefaultValues = (): InvoiceForm => {
  const sentAt = fromDate(startOfToday(), getLocalTimeZone())
  const dueAt = sentAt.add({ days: 30 })

  return {
    invoiceNumber: '',
    terms: InvoiceTermsValues.Net30,
    sentAt,
    dueAt,
    customer: null,
    email: '',
    address: '',
    lineItems: [getEmptyLineItem()],
    memo: '',
    discountRate: BIG_DECIMAL_ZERO,
    taxRate: BIG_DECIMAL_ZERO,
  }
}

const getInvoiceLineItemAmount = (lineItem: InvoiceLineItem): BD.BigDecimal => {
  const { unitPrice, quantity } = lineItem

  return BD.multiply(quantity, convertCentsToBigDecimal(unitPrice))
}

const getInvoiceFormLineItem = (lineItem: InvoiceLineItem): InvoiceFormLineItem => {
  const { product, description, unitPrice, quantity } = lineItem

  return {
    product: product || '',
    description: description || '',
    quantity: BD.normalize(quantity),
    unitPrice: convertCentsToBigDecimal(unitPrice),
    amount: getInvoiceLineItemAmount(lineItem),
    isTaxable: lineItem.salesTaxTotal > 0,
  }
}

const getInvoiceFormInitialValues = (invoice: Invoice): InvoiceForm => {
  const invoiceFormLineItems = invoice.lineItems.map(getInvoiceFormLineItem)

  const subtotal = computeSubtotal(invoiceFormLineItems)
  const rawTaxableSubtotal = computeRawTaxableSubtotal(invoiceFormLineItems)

  const additionalDiscount = convertCentsToBigDecimal(invoice.additionalDiscount)
  const discountRate = safeDivide(additionalDiscount, subtotal)

  const taxableSubtotal = computeTaxableSubtotal({ rawTaxableSubtotal, discountRate })

  const taxes = invoice.lineItems.reduce(
    (sum, item) =>
      BD.sum(sum, convertCentsToBigDecimal(item.salesTaxTotal)), BIG_DECIMAL_ZERO)
  const taxRate = safeDivide(taxes, taxableSubtotal)
  const sentAt = invoice.sentAt ? fromDate(invoice.sentAt, 'UTC') : null
  const dueAt = invoice.dueAt ? fromDate(invoice.dueAt, 'UTC') : null

  return {
    terms: getInvoiceTermsFromDates(sentAt, dueAt),
    invoiceNumber: invoice.invoiceNumber || '',
    sentAt,
    dueAt,
    customer: invoice.customer,
    email: invoice.customer?.email || '',
    address: invoice.customer?.addressString || '',
    lineItems: invoiceFormLineItems,
    discountRate,
    taxRate,
    memo: invoice.memo || '',
  }
}

function isUpdateMode(props: UseInvoiceFormProps): props is { mode: UpsertInvoiceMode.Update, invoice: Invoice } {
  return props.mode === UpsertInvoiceMode.Update
}

type UseInvoiceFormProps =
  | { onSuccess?: (invoice: Invoice) => void, mode: UpsertInvoiceMode.Create }
  | { onSuccess?: (invoice: Invoice) => void, mode: UpsertInvoiceMode.Update, invoice: Invoice }

export const useInvoiceForm = (props: UseInvoiceFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, mode } = props

  const upsertInvoiceProps = mode === UpsertInvoiceMode.Update ? { mode, invoiceId: props.invoice.id } : { mode }
  const { trigger: upsertInvoice } = useUpsertInvoice(upsertInvoiceProps)

  const defaultValuesRef = useRef<InvoiceForm>(
    isUpdateMode(props)
      ? getInvoiceFormInitialValues(props.invoice)
      : getInvoiceFormDefaultValues(),
  )
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: InvoiceForm }) => {
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
  }, [onSuccess, upsertInvoice])

  const form = useAppForm<InvoiceForm>({ defaultValues, onSubmit })
  const isFormValid = useStore(form.store, state => state.isValid)

  const discountRate = useStore(form.store, state => state.values.discountRate)
  const taxRate = useStore(form.store, state => state.values.taxRate)

  const { subtotal, rawTaxableSubtotal } = useStore(form.store, (state) => {
    const lineItems = state.values.lineItems
    return {
      subtotal: computeSubtotal(lineItems),
      rawTaxableSubtotal: computeRawTaxableSubtotal(lineItems),
    }
  })

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

  return useMemo(() => (
    { form, subtotal, additionalDiscount, taxableSubtotal, taxes, grandTotal, submitError, isFormValid }),
  [form, subtotal, additionalDiscount, taxableSubtotal, taxes, grandTotal, submitError, isFormValid])
}

import { type Invoice, type InvoiceForm, type InvoiceFormLineItem, type InvoiceLineItem } from '../../../features/invoices/invoiceSchemas'
import { BigDecimal as BD } from 'effect'
import { BIG_DECIMAL_ZERO, BIG_DECIMAL_ONE, convertCentsToBigDecimal, safeDivide, convertBigDecimalToCents } from '../../../utils/bigDecimalUtils'
import {
  computeRawTaxableSubtotal,
  computeSubtotal,
  computeTaxableSubtotal,
  getGrandTotalFromInvoice,
} from './totalsUtils'
import { startOfToday } from 'date-fns'
import { getLocalTimeZone, fromDate } from '@internationalized/date'
import { getInvoiceTermsFromDates, InvoiceTermsValues } from '../InvoiceTermsComboBox/InvoiceTermsComboBox'
import { isEqualWith } from 'lodash'
import { ValidationErrorMap } from '@tanstack/react-form'

export type InvoiceFormState = {
  isFormValid: boolean
  isSubmitting: boolean
  submitError: string | undefined
}

export const getEmptyLineItem = (): InvoiceFormLineItem => ({
  product: '',
  description: '',
  unitPrice: BIG_DECIMAL_ZERO,
  quantity: BIG_DECIMAL_ONE,
  amount: BIG_DECIMAL_ZERO,
  isTaxable: false,
})

export const getInvoiceFormDefaultValues = (): InvoiceForm => {
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

export const getInvoiceFormInitialValues = (invoice: Invoice): InvoiceForm => {
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

const getIsEqualLineItems = (a: InvoiceFormLineItem, b: InvoiceFormLineItem) => {
  return isEqualWith(a, b, (val1, val2, key) => {
    if (key === 'unitPrice' || key === 'quantity' || key === 'amount') {
      return BD.isBigDecimal(val1) && BD.isBigDecimal(val2) && BD.equals(val1, val2)
    }
    return undefined
  })
}

export const validateOnSubmit = ({ value: invoice }: { value: InvoiceForm }) => {
  const errors = []
  if (invoice.customer === null) {
    errors.push({ customer: 'Customer is a required field.' })
  }

  if (!invoice.invoiceNumber.trim()) {
    errors.push({ invoiceNumber: 'Invoice number is a required field.' })
  }

  if (invoice.sentAt === null) {
    errors.push({ sentAt: 'Invoice date is a required field.' })
  }

  if (invoice.dueAt === null) {
    errors.push({ dueAt: 'Due date is a required field.' })
  }

  if (invoice.lineItems.length === 0) {
    errors.push({ lineItems: 'Invoice requires at least one line item.' })
  }

  const emptyLineItem = getEmptyLineItem()
  invoice.lineItems.some((item) => {
    if (!getIsEqualLineItems(item, emptyLineItem) && (item.product === '')) {
      errors.push({ lineItems: 'Invoice has incomplete line items. Please include required field Product/Service.' })
      return true
    }
  })

  const grandTotal = getGrandTotalFromInvoice(invoice)
  if (BD.isNegative(grandTotal)) {
    errors.push({ lineItems: 'Invoice has a negative total.' })
  }

  return errors.length > 0 ? errors : null
}

export function flattenValidationErrors(errors: ValidationErrorMap): string[] {
  return Object.values(errors)
    .filter((value): value is { [key: string]: string }[] =>
      Array.isArray(value)
      && value.every(entry => typeof entry === 'object' && entry !== null),
    )
    .flatMap(errorArray =>
      errorArray.flatMap(entry =>
        Object.values(entry),
      ),
    )
}

export const convertInvoiceFormToParams = (form: InvoiceForm): unknown => ({
  customerId: form.customer?.id,
  dueAt: form.dueAt?.toDate(),
  sentAt: form.sentAt?.toDate(),
  invoiceNumber: form.invoiceNumber || undefined,
  memo: form.memo,

  lineItems: form.lineItems.map((item) => {
    const baseLineItem = {
      description: item.description,
      product: item.product,
      unitPrice: convertBigDecimalToCents(item.unitPrice),
      quantity: item.quantity,
    }

    return !BD.equals(form.taxRate, BIG_DECIMAL_ZERO) && item.isTaxable
      ? {
        ...baseLineItem,
        salesTaxes: [
          {
            amount: convertBigDecimalToCents(
              BD.multiply(item.amount, form.taxRate),
            ),
          },
        ],
      }
      : baseLineItem
  }),

  ...(!BD.equals(form.discountRate, BIG_DECIMAL_ZERO) && {
    additionalDiscount: convertBigDecimalToCents(
      BD.multiply(computeSubtotal(form.lineItems), form.discountRate),
    ),
  }),
})

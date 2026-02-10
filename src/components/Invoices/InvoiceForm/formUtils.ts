import { fromDate, getLocalTimeZone, toCalendarDate } from '@internationalized/date'
import { startOfToday } from 'date-fns'
import { BigDecimal as BD } from 'effect'

import {
  fromNonRecursiveBigDecimal,
  NRBD_ONE,
  NRBD_ZERO,
  toNonRecursiveBigDecimal,
} from '@schemas/nonRecursiveBigDecimal'
import {
  BIG_DECIMAL_ZERO,
  convertBigDecimalToCents,
  convertCentsToBigDecimal,
  safeDivide,
} from '@utils/bigDecimalUtils'
import {
  computeAdditionalDiscount,
  computeRawTaxableSubtotal,
  computeSubtotal,
  computeTaxableSubtotal,
  computeTaxes,
  getGrandTotalFromInvoice,
} from '@components/Invoices/InvoiceForm/totalsUtils'
import { getInvoiceTermsFromDates, InvoiceTermsValues } from '@components/Invoices/InvoiceTermsComboBox/InvoiceTermsComboBox'
import { type Invoice, type InvoiceForm, type InvoiceFormLineItem, InvoiceFormLineItemEquivalence, type InvoiceLineItem } from '@features/invoices/invoiceSchemas'

export type InvoiceFormState = {
  isDirty: boolean
  isSubmitting: boolean
}

export const EMPTY_LINE_ITEM: InvoiceFormLineItem = {
  description: '',
  unitPrice: NRBD_ZERO,
  quantity: NRBD_ONE,
  amount: NRBD_ZERO,
  isTaxable: false,
}

export const isEmptyLineItem = (item: InvoiceFormLineItem): boolean => {
  return InvoiceFormLineItemEquivalence(EMPTY_LINE_ITEM, item)
}

export const computeLineItemAmount = (unitPrice: InvoiceFormLineItem['unitPrice'], quantity: InvoiceFormLineItem['quantity']) => {
  const bdUnitPrice = fromNonRecursiveBigDecimal(unitPrice)
  const bdQuantity = fromNonRecursiveBigDecimal(quantity)
  return toNonRecursiveBigDecimal(BD.round(BD.normalize(BD.multiply(bdUnitPrice, bdQuantity)), { scale: 2 }))
}

export const computeLineItemUnitPrice = (amount: InvoiceFormLineItem['amount'], quantity: InvoiceFormLineItem['quantity']) => {
  const bdAmount = fromNonRecursiveBigDecimal(amount)
  const bdQuantity = fromNonRecursiveBigDecimal(quantity)
  return toNonRecursiveBigDecimal(BD.round(BD.normalize(safeDivide(bdAmount, bdQuantity)), { scale: 2 }))
}

export const getEmptyInvoiceFormValues = (): InvoiceForm => {
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
    lineItems: [EMPTY_LINE_ITEM],
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
  const { description, unitPrice, quantity } = lineItem

  return {
    description: description || '',
    quantity: toNonRecursiveBigDecimal(quantity),
    unitPrice: toNonRecursiveBigDecimal(convertCentsToBigDecimal(unitPrice)),
    amount: toNonRecursiveBigDecimal(getInvoiceLineItemAmount(lineItem)),
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

export const getInvoiceFormDefaultValues = (invoice: Invoice | null): InvoiceForm => {
  return invoice ? getInvoiceFormInitialValues(invoice) : getEmptyInvoiceFormValues()
}

export const validateInvoiceForm = ({ value: invoice }: { value: InvoiceForm }) => {
  const { customer, invoiceNumber, sentAt, dueAt, lineItems } = invoice

  const errors = []
  if (customer === null) {
    errors.push({ customer: 'Customer is a required field.' })
  }

  if (!invoiceNumber.trim()) {
    errors.push({ invoiceNumber: 'Invoice number is a required field.' })
  }

  if (sentAt === null) {
    errors.push({ sentAt: 'Invoice date is a required field.' })
  }

  if (dueAt === null) {
    errors.push({ dueAt: 'Due date is a required field.' })
  }

  if (sentAt !== null && dueAt !== null && toCalendarDate(dueAt).compare(toCalendarDate(sentAt)) < 0) {
    errors.push({ dueAt: 'Due date must be after invoice date.' })
  }

  const nonEmptyLineItems = lineItems.filter(item => !InvoiceFormLineItemEquivalence(EMPTY_LINE_ITEM, item))

  if (nonEmptyLineItems.length === 0) {
    errors.push({ lineItems: 'Invoice requires at least one non-empty line item.' })
  }

  nonEmptyLineItems.some((item) => {
    if (item.description.trim() === '') {
      errors.push({ lineItems: 'Invoice has incomplete line items. Please include required field: Description.' })
      return true
    }
  })

  const grandTotal = getGrandTotalFromInvoice(invoice)
  if (BD.isNegative(grandTotal)) {
    errors.push({ lineItems: 'Invoice has a negative total.' })
  }

  return errors.length > 0 ? errors : null
}

export const convertInvoiceFormToParams = (
  form: InvoiceForm,
): unknown => ({
  customerId: form.customer?.id,
  dueAt: form.dueAt?.toDate(),
  sentAt: form.sentAt?.toDate(),
  invoiceNumber: form.invoiceNumber.trim(),
  memo: form.memo.trim(),

  lineItems: form.lineItems
    .filter(item => !InvoiceFormLineItemEquivalence(EMPTY_LINE_ITEM, item))
    .map((item) => {
      const baseLineItem = {
        description: item.description.trim(),
        unitPrice: convertBigDecimalToCents(fromNonRecursiveBigDecimal(item.unitPrice)),
        quantity: fromNonRecursiveBigDecimal(item.quantity),
      }

      if (!item.isTaxable || BD.equals(form.taxRate, BIG_DECIMAL_ZERO)) return baseLineItem

      const itemAmount = fromNonRecursiveBigDecimal(item.amount)
      const itemTaxableSubtotal = computeTaxableSubtotal({ rawTaxableSubtotal: itemAmount, discountRate: form.discountRate })
      const itemTaxes = computeTaxes({ taxableSubtotal: itemTaxableSubtotal, taxRate: form.taxRate })

      return { ...baseLineItem, salesTaxes: [{ amount: convertBigDecimalToCents(itemTaxes) }] }
    }),

  ...(!BD.equals(form.discountRate, BIG_DECIMAL_ZERO) && {
    additionalDiscount: convertBigDecimalToCents(
      computeAdditionalDiscount({ subtotal: computeSubtotal(form.lineItems), discountRate: form.discountRate }),
    ),
  }),
})

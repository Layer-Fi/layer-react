import { fromDate, getLocalTimeZone, toCalendarDate } from '@internationalized/date'
import { startOfToday } from 'date-fns'
import { BigDecimal as BD } from 'effect'
import type { TFunction } from 'i18next'

import { type Invoice, type InvoiceForm, type InvoiceFormLineItem, InvoiceFormLineItemEquivalence, type InvoiceLineItem } from '@schemas/invoices/invoice'
import {
  fromNonRecursiveBigDecimal,
  NRBD_ONE,
  NRBD_ZERO,
  nrbdEquals,
  toNonRecursiveBigDecimal,
} from '@schemas/nonRecursiveBigDecimal'
import {
  BIG_DECIMAL_ZERO,
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
    discountRate: NRBD_ZERO,
    taxRate: NRBD_ZERO,
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
  const discountRate = safeDivide(additionalDiscount, fromNonRecursiveBigDecimal(subtotal))

  const taxableSubtotal = computeTaxableSubtotal({ rawTaxableSubtotal, discountRate: toNonRecursiveBigDecimal(discountRate) })

  const taxes = invoice.lineItems.reduce(
    (sum, item) =>
      BD.sum(sum, convertCentsToBigDecimal(item.salesTaxTotal)), BIG_DECIMAL_ZERO)
  const taxRate = safeDivide(taxes, fromNonRecursiveBigDecimal(taxableSubtotal))
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
    discountRate: toNonRecursiveBigDecimal(discountRate),
    taxRate: toNonRecursiveBigDecimal(taxRate),
    memo: invoice.memo || '',
  }
}

export const getInvoiceFormDefaultValues = (invoice: Invoice | null): InvoiceForm => {
  return invoice ? getInvoiceFormInitialValues(invoice) : getEmptyInvoiceFormValues()
}

export const validateInvoiceForm = ({ value: invoice }: { value: InvoiceForm }, t: TFunction) => {
  const { customer, invoiceNumber, sentAt, dueAt, lineItems } = invoice

  const errors = []
  if (customer === null) {
    errors.push({ customer: t('invoices:validation.customer_required', 'Customer is a required field.') })
  }

  if (!invoiceNumber.trim()) {
    errors.push({ invoiceNumber: t('invoices:validation.invoice_number_required', 'Invoice number is a required field.') })
  }

  if (sentAt === null) {
    errors.push({ sentAt: t('invoices:validation.invoice_date_required', 'Invoice date is a required field.') })
  }

  if (dueAt === null) {
    errors.push({ dueAt: t('invoices:validation.due_date_required', 'Due date is a required field.') })
  }

  if (sentAt !== null && dueAt !== null && toCalendarDate(dueAt).compare(toCalendarDate(sentAt)) < 0) {
    errors.push({ dueAt: t('invoices:validation.due_date_must', 'Due date must be after invoice date.') })
  }

  const nonEmptyLineItems = lineItems.filter(item => !InvoiceFormLineItemEquivalence(EMPTY_LINE_ITEM, item))

  if (nonEmptyLineItems.length === 0) {
    errors.push({ lineItems: t('invoices:validation.invoice_requires_empty', 'Invoice requires at least one non-empty line item.') })
  }

  nonEmptyLineItems.some((item) => {
    if (item.description.trim() === '') {
      errors.push({
        lineItems: t('invoices:validation.invoice_incomplete_required', 'Invoice has incomplete line items. Please include required field: Description.'),
      })
      return true
    }
  })

  const grandTotal = getGrandTotalFromInvoice(invoice)
  if (BD.isNegative(fromNonRecursiveBigDecimal(grandTotal))) {
    errors.push({ lineItems: t('invoices:label.invoice_negative_total', 'Invoice has a negative total.') })
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

      if (!item.isTaxable || nrbdEquals(form.taxRate, NRBD_ZERO)) return baseLineItem

      const itemTaxableSubtotal = computeTaxableSubtotal({ rawTaxableSubtotal: item.amount, discountRate: form.discountRate })
      const itemTaxes = computeTaxes({ taxableSubtotal: itemTaxableSubtotal, taxRate: form.taxRate })

      return { ...baseLineItem, salesTaxes: [{ amount: convertNonRecursiveBigDecimalToCents(itemTaxes) }] }
    }),

  ...(!nrbdEquals(form.discountRate, NRBD_ZERO) && {
    additionalDiscount: convertNonRecursiveBigDecimalToCents(
      computeAdditionalDiscount({ subtotal: computeSubtotal(form.lineItems), discountRate: form.discountRate }),
    ),
  }),
})

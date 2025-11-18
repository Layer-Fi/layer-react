import { fromDate, getLocalTimeZone, toCalendarDate } from '@internationalized/date'
import { startOfToday } from 'date-fns'
import { BigDecimal as BD } from 'effect'

import { BIG_DECIMAL_ONE, BIG_DECIMAL_ZERO, convertBigDecimalToCents, convertCentsToBigDecimal, safeDivide } from '@utils/bigDecimalUtils'
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
import { makeTagFromTransactionTag, makeTagKeyValueFromTag, type Tag } from '@features/tags/tagSchemas'

export const INVOICE_MECE_TAG_DIMENSION = 'Job'

export type InvoiceFormState = {
  isDirty: boolean
  isSubmitting: boolean
}

export const EMPTY_LINE_ITEM: InvoiceFormLineItem = {
  description: '',
  unitPrice: BIG_DECIMAL_ZERO,
  quantity: BIG_DECIMAL_ONE,
  amount: BIG_DECIMAL_ZERO,
  isTaxable: false,
  accountIdentifier: null,
  tags: [],
}

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
    lineItems: [EMPTY_LINE_ITEM],
    memo: '',
    discountRate: BIG_DECIMAL_ZERO,
    taxRate: BIG_DECIMAL_ZERO,
  }
}

export const getAdditionalTags = (tags: readonly Tag[]): Tag[] => {
  return tags.filter(obj => obj.key.toLowerCase() !== INVOICE_MECE_TAG_DIMENSION.toLowerCase())
}

export const getSelectedTag = (tags: readonly Tag[]): Tag | null => {
  return tags.find(obj => obj.key.toLowerCase() === INVOICE_MECE_TAG_DIMENSION.toLowerCase()) ?? null
}

const getInvoiceLineItemAmount = (lineItem: InvoiceLineItem): BD.BigDecimal => {
  const { unitPrice, quantity } = lineItem

  return BD.multiply(quantity, convertCentsToBigDecimal(unitPrice))
}

const getInvoiceFormLineItem = (lineItem: InvoiceLineItem): InvoiceFormLineItem => {
  const { description, unitPrice, quantity } = lineItem

  return {
    description: description || '',
    quantity: BD.normalize(quantity),
    unitPrice: convertCentsToBigDecimal(unitPrice),
    amount: getInvoiceLineItemAmount(lineItem),
    isTaxable: lineItem.salesTaxTotal > 0,
    accountIdentifier: lineItem.accountIdentifier,
    tags: lineItem.transactionTags.map(makeTagFromTransactionTag),
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
    if (item.accountIdentifier === null) {
      errors.push({ lineItems: 'Invoice has incomplete line items. Please include required field: Revenue account.' })
      return true
    }

    if (getSelectedTag(item.tags) === null) {
      errors.push({ lineItems: `Invoice has incomplete line items. Please include required field: ${INVOICE_MECE_TAG_DIMENSION}.` })
      return true
    }

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

export const convertInvoiceFormToParams = (form: InvoiceForm): unknown => ({
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
        unitPrice: convertBigDecimalToCents(item.unitPrice),
        quantity: item.quantity,
        tags: item.tags.map(makeTagKeyValueFromTag),
        ...(item.accountIdentifier && { accountIdentifier: item.accountIdentifier }),
      }

      if (!item.isTaxable || BD.equals(form.taxRate, BIG_DECIMAL_ZERO)) return baseLineItem

      const itemTaxableSubtotal = computeTaxableSubtotal({ rawTaxableSubtotal: item.amount, discountRate: form.discountRate })
      const itemTaxes = computeTaxes({ taxableSubtotal: itemTaxableSubtotal, taxRate: form.taxRate })

      return { ...baseLineItem, salesTaxes: [{ amount: convertBigDecimalToCents(itemTaxes) }] }
    }),

  ...(!BD.equals(form.discountRate, BIG_DECIMAL_ZERO) && {
    additionalDiscount: convertBigDecimalToCents(
      computeAdditionalDiscount({ subtotal: computeSubtotal(form.lineItems), discountRate: form.discountRate }),
    ),
  }),
})

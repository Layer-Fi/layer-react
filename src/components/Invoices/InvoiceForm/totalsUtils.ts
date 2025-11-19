import { BigDecimal as BD } from 'effect'

import { BIG_DECIMAL_ZERO, roundDecimalToCents } from '@utils/bigDecimalUtils'
import type { InvoiceForm, InvoiceFormLineItem } from '@features/invoices/invoiceSchemas'

export function computeSubtotal(lineItems: InvoiceFormLineItem[]): BD.BigDecimal
export function computeSubtotal(lineItems: readonly InvoiceFormLineItem[]): BD.BigDecimal

export function computeSubtotal(
  lineItems: readonly InvoiceFormLineItem[],
): BD.BigDecimal {
  return lineItems.reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)
}

export const computeRawTaxableSubtotal = (lineItems: InvoiceFormLineItem[]): BD.BigDecimal =>
  lineItems
    .filter(item => item.isTaxable)
    .reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

export function computeAdditionalDiscount({
  subtotal,
  discountRate,
}: {
  subtotal: BD.BigDecimal
  discountRate: BD.BigDecimal
}) {
  const rawDiscountAmount = BD.multiply(subtotal, discountRate)
  const additionalDiscount = roundDecimalToCents(rawDiscountAmount)

  return additionalDiscount
}

export function computeTaxableSubtotal({
  rawTaxableSubtotal,
  discountRate,
}: {
  rawTaxableSubtotal: BD.BigDecimal
  discountRate: BD.BigDecimal
}) {
  const discountForTaxableSubtotal = BD.multiply(rawTaxableSubtotal, discountRate)
  const taxableSubtotal = BD.subtract(rawTaxableSubtotal, discountForTaxableSubtotal)

  return taxableSubtotal
}

export function computeTaxes({
  taxableSubtotal,
  taxRate,
}: {
  taxableSubtotal: BD.BigDecimal
  taxRate: BD.BigDecimal
}) {
  const rawTaxAmount = BD.multiply(taxableSubtotal, taxRate)
  const taxes = roundDecimalToCents(rawTaxAmount)

  return taxes
}

export function computeGrandTotal({
  subtotal,
  additionalDiscount,
  taxes,
}: {
  subtotal: BD.BigDecimal
  additionalDiscount: BD.BigDecimal
  taxes: BD.BigDecimal
}) {
  const subtotalLessDiscounts = BD.subtract(subtotal, additionalDiscount)
  const grandTotal = BD.sum(subtotalLessDiscounts, taxes)

  return grandTotal
}

export const getGrandTotalFromInvoice = (invoice: InvoiceForm): BD.BigDecimal => {
  const { lineItems, discountRate, taxRate } = invoice

  const subtotal = computeSubtotal(lineItems)
  const rawTaxableSubtotal = computeRawTaxableSubtotal(lineItems)

  const taxableSubtotal = computeTaxableSubtotal({ rawTaxableSubtotal, discountRate })
  const taxes = computeTaxes({ taxableSubtotal, taxRate })

  const additionalDiscount = computeAdditionalDiscount({ subtotal, discountRate })
  const grandTotal = computeGrandTotal({ subtotal, additionalDiscount, taxes })

  return grandTotal
}

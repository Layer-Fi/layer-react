import { BigDecimal as BD } from 'effect'
import type { InvoiceFormLineItem } from '../../../features/invoices/invoiceSchemas'
import { BIG_DECIMAL_ZERO, roundDecimalToCents } from '../../../utils/bigDecimalUtils'

export const computeSubtotal = (lineItems: InvoiceFormLineItem[]): BD.BigDecimal =>
  lineItems.reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

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

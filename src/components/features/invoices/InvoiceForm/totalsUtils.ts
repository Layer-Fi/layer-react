import { BigDecimal as BD } from 'effect'

import type { InvoiceForm, InvoiceFormLineItem } from '@schemas/invoices/invoice'
import { fromNonRecursiveBigDecimal, type NonRecursiveBigDecimal, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import { BIG_DECIMAL_ZERO, roundDecimalToCents } from '@utils/bigDecimalUtils'

export function computeSubtotal(lineItems: InvoiceFormLineItem[]): NonRecursiveBigDecimal
export function computeSubtotal(lineItems: readonly InvoiceFormLineItem[]): NonRecursiveBigDecimal

export function computeSubtotal(
  lineItems: readonly InvoiceFormLineItem[],
): NonRecursiveBigDecimal {
  return toNonRecursiveBigDecimal(
    lineItems.reduce((sum, item) => BD.sum(sum, fromNonRecursiveBigDecimal(item.amount)), BIG_DECIMAL_ZERO),
  )
}

export const computeRawTaxableSubtotal = (lineItems: InvoiceFormLineItem[]): NonRecursiveBigDecimal => {
  const sum = lineItems
    .filter(item => item.isTaxable)
    .reduce((sum, item) => BD.sum(sum, fromNonRecursiveBigDecimal(item.amount)), BIG_DECIMAL_ZERO)
  return toNonRecursiveBigDecimal(sum)
}

export function computeAdditionalDiscount({
  subtotal,
  discountRate,
}: {
  subtotal: NonRecursiveBigDecimal
  discountRate: NonRecursiveBigDecimal
}): NonRecursiveBigDecimal {
  const rawDiscountAmount = BD.multiply(fromNonRecursiveBigDecimal(subtotal), fromNonRecursiveBigDecimal(discountRate))
  const additionalDiscount = roundDecimalToCents(rawDiscountAmount)

  return toNonRecursiveBigDecimal(additionalDiscount)
}

export function computeTaxableSubtotal({
  rawTaxableSubtotal,
  discountRate,
}: {
  rawTaxableSubtotal: NonRecursiveBigDecimal
  discountRate: NonRecursiveBigDecimal
}): NonRecursiveBigDecimal {
  const rawTaxableSubtotalBd = fromNonRecursiveBigDecimal(rawTaxableSubtotal)
  const discountForTaxableSubtotal = BD.multiply(rawTaxableSubtotalBd, fromNonRecursiveBigDecimal(discountRate))
  const taxableSubtotal = BD.subtract(rawTaxableSubtotalBd, discountForTaxableSubtotal)

  return toNonRecursiveBigDecimal(taxableSubtotal)
}

export function computeTaxes({
  taxableSubtotal,
  taxRate,
}: {
  taxableSubtotal: NonRecursiveBigDecimal
  taxRate: NonRecursiveBigDecimal
}): NonRecursiveBigDecimal {
  const rawTaxAmount = BD.multiply(fromNonRecursiveBigDecimal(taxableSubtotal), fromNonRecursiveBigDecimal(taxRate))
  const taxes = roundDecimalToCents(rawTaxAmount)

  return toNonRecursiveBigDecimal(taxes)
}

export function computeGrandTotal({
  subtotal,
  additionalDiscount,
  taxes,
}: {
  subtotal: NonRecursiveBigDecimal
  additionalDiscount: NonRecursiveBigDecimal
  taxes: NonRecursiveBigDecimal
}): NonRecursiveBigDecimal {
  const subtotalLessDiscounts = BD.subtract(fromNonRecursiveBigDecimal(subtotal), fromNonRecursiveBigDecimal(additionalDiscount))
  const grandTotal = BD.sum(subtotalLessDiscounts, fromNonRecursiveBigDecimal(taxes))

  return toNonRecursiveBigDecimal(grandTotal)
}

export const getGrandTotalFromInvoice = (invoice: InvoiceForm): NonRecursiveBigDecimal => {
  const { lineItems, discountRate, taxRate } = invoice

  const subtotal = computeSubtotal(lineItems)
  const rawTaxableSubtotal = computeRawTaxableSubtotal(lineItems)

  const taxableSubtotal = computeTaxableSubtotal({ rawTaxableSubtotal, discountRate })
  const taxes = computeTaxes({ taxableSubtotal, taxRate })

  const additionalDiscount = computeAdditionalDiscount({ subtotal, discountRate })
  const grandTotal = computeGrandTotal({ subtotal, additionalDiscount, taxes })

  return grandTotal
}

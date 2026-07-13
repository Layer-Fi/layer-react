import { BigDecimal, type FastCheck } from 'effect'

import { type InvoiceLineItem, InvoiceStatus } from '@schemas/invoices/invoice'

import { customers as customerPool } from '@fixtures/generated/customers.gen'
import { invoiceLineItemDescriptions } from '@fixtures/invoices/constants'
import { centsAmountArbitrary } from '@fixtures/utils/arbitrary/amount'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'

const SALES_TAX_RATE = 0.08

export const invoiceCustomerArbitrary = nullableConstantFrom(
  customerPool,
  { nullWeight: 1, valueWeight: 9 },
)

export const invoiceStatusArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(InvoiceStatus.Saved), weight: 5 },
    { arbitrary: fc.constant(InvoiceStatus.Paid), weight: 5 },
    { arbitrary: fc.constant(InvoiceStatus.PartiallyPaid), weight: 3 },
    { arbitrary: fc.constant(InvoiceStatus.Draft), weight: 1 },
    { arbitrary: fc.constant(InvoiceStatus.Voided), weight: 1 },
    { arbitrary: fc.constant(InvoiceStatus.WrittenOff), weight: 1 },
    { arbitrary: fc.constant(InvoiceStatus.PartiallyWrittenOff), weight: 1 },
    { arbitrary: fc.constant(InvoiceStatus.Refunded), weight: 1 },
  )

const invoiceLineItemArbitrary = (fc: typeof FastCheck): FastCheck.Arbitrary<InvoiceLineItem> =>
  fc.record({
    id: idArbitrary(FixtureIdPrefix.invoiceLineItem)(fc),
    description: fc.constantFrom(...invoiceLineItemDescriptions),
    unitPrice: centsAmountArbitrary({ minDollars: 20, maxDollars: 400, stepDollars: 5 })(fc),
    quantity: fc.integer({ min: 1, max: 5 }),
    isTaxable: fc.boolean(),
  }).map(({ id, description, unitPrice, quantity, isTaxable }) => {
    const subtotal = unitPrice * quantity
    const salesTaxTotal = isTaxable ? Math.round(subtotal * SALES_TAX_RATE) : 0

    return {
      id,
      externalId: null,
      // Placeholder — the invoice arbitrary stamps each line item with its parent id.
      invoiceId: id,
      description,
      unitPrice,
      quantity: BigDecimal.unsafeFromString(String(quantity)),
      subtotal,
      discountAmount: 0,
      salesTaxTotal,
      totalAmount: subtotal + salesTaxTotal,
      memo: null,
      transactionTags: [],
      accountIdentifier: null,
    }
  })

export const invoiceLineItemsArbitrary = (fc: typeof FastCheck) =>
  fc.array(invoiceLineItemArbitrary(fc), { minLength: 1, maxLength: 4 })

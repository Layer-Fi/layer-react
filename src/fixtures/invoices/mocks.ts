import { BigDecimal } from 'effect'

import { type Invoice, type InvoiceLineItem, InvoiceStatus } from '@schemas/invoices/invoice'

import { makeBusiness } from '@fixtures/business/mocks'
import { makeCustomer } from '@fixtures/customers/mocks'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const INVOICE_ID = '0000000d-0000-4000-8000-000000000001'

const baseInvoiceLineItem: InvoiceLineItem = {
  id: '0000000e-0000-4000-8000-000000000001',
  externalId: null,
  invoiceId: INVOICE_ID,
  description: 'Design consultation',
  unitPrice: 15000,
  quantity: BigDecimal.unsafeFromString('2'),
  subtotal: 30000,
  discountAmount: 0,
  salesTaxTotal: 2400,
  totalAmount: 32400,
  memo: null,
  transactionTags: [],
  accountIdentifier: null,
}

const baseInvoice: Invoice = {
  id: INVOICE_ID,
  businessId: makeBusiness().id,
  externalId: null,
  status: InvoiceStatus.Saved,
  sentAt: new Date('2025-03-01T16:30:00.000Z'),
  dueAt: new Date('2025-03-31T16:30:00.000Z'),
  paidAt: null,
  voidedAt: null,
  invoiceNumber: 'INV-1001',
  recipientName: 'Acme Corp',
  customer: makeCustomer(),
  lineItems: [baseInvoiceLineItem],
  subtotal: 30000,
  additionalDiscount: 0,
  additionalSalesTaxesTotal: 2400,
  totalAmount: 32400,
  outstandingBalance: 32400,
  importedAt: null,
  updatedAt: new Date('2025-03-01T16:30:00.000Z'),
  memo: null,
  customPaymentInstructions: null,
}

export const { make: makeInvoice, makeMany: makeInvoices } =
  createFixtureFactory(baseInvoice)

export const { make: makeInvoiceLineItem, makeMany: makeInvoiceLineItems } =
  createFixtureFactory(baseInvoiceLineItem)

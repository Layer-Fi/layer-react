import { BigDecimal, Schema } from 'effect'

import { type Invoice, type InvoiceLineItem, type UpsertInvoiceLineItem, UpsertInvoiceSchema } from '@schemas/invoices/invoice'

import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { readRequestJson } from '@msw/utils/request'

const decodeUpsertInvoice = Schema.decodeUnknownSync(UpsertInvoiceSchema)

const buildLineItem = (invoiceId: string, lineItem: UpsertInvoiceLineItem): InvoiceLineItem => {
  const subtotal = Math.round(lineItem.unitPrice * BigDecimal.unsafeToNumber(lineItem.quantity))
  const salesTaxTotal = (lineItem.salesTaxes ?? []).reduce((sum, tax) => sum + tax.amount, 0)

  return {
    id: crypto.randomUUID(),
    externalId: null,
    invoiceId,
    description: lineItem.description,
    unitPrice: lineItem.unitPrice,
    quantity: lineItem.quantity,
    subtotal,
    discountAmount: 0,
    salesTaxTotal,
    totalAmount: subtotal + salesTaxTotal,
    memo: null,
    transactionTags: [],
    accountIdentifier: lineItem.accountIdentifier ?? null,
  }
}

export const invoiceFromUpsertRequest = async (request: Request, base: Invoice): Promise<Invoice> => {
  const body = decodeUpsertInvoice(await readRequestJson(request))

  const customer = customerStore.findById(body.customerId) ?? base.customer
  const lineItems = body.lineItems.map(lineItem => buildLineItem(base.id, lineItem))
  const subtotal = lineItems.reduce((sum, lineItem) => sum + lineItem.subtotal, 0)
  const additionalSalesTaxesTotal = lineItems.reduce((sum, lineItem) => sum + lineItem.salesTaxTotal, 0)
  const additionalDiscount = body.additionalDiscount ?? 0
  const totalAmount = subtotal + additionalSalesTaxesTotal - additionalDiscount
  const alreadyPaid = base.totalAmount - base.outstandingBalance

  return {
    ...base,
    sentAt: body.sentAt,
    dueAt: body.dueAt,
    invoiceNumber: body.invoiceNumber ?? base.invoiceNumber,
    customer,
    recipientName: customer != null
      ? customer.companyName ?? customer.individualName
      : base.recipientName,
    memo: body.memo ?? null,
    customPaymentInstructions: body.customPaymentInstructions ?? base.customPaymentInstructions,
    lineItems,
    subtotal,
    additionalDiscount,
    additionalSalesTaxesTotal,
    totalAmount,
    outstandingBalance: Math.max(0, totalAmount - alreadyPaid),
    updatedAt: new Date(),
  }
}

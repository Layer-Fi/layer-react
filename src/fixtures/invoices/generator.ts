import { InvoiceStatus } from '@schemas/invoices/invoice'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { schema } from '@fixtures/invoices/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

const DAYS_IN_YEAR = 365
const DAY_MS = 24 * 60 * 60 * 1000

const PAYMENT_TERMS_DAYS = [15, 30, 30, 60]

const generateInvoices = createGenerator(schema, {
  uniqueBy: [invoice => invoice.id],
  numRuns: 30,
})

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS)

export const generator: typeof generateInvoices = (overrides) => {
  const invoices = generateInvoices(overrides)

  return invoices
    .map((invoice, index) => {
      const dayOffset = Math.floor((index * DAYS_IN_YEAR) / invoices.length)
      const issuedAt = new Date(Date.UTC(FIXTURE_YEAR, 0, 1 + dayOffset, 16, 30))
      const isDraft = invoice.status === InvoiceStatus.Draft

      return {
        ...invoice,
        invoiceNumber: `INV-${String(1001 + index)}`,
        sentAt: isDraft ? null : issuedAt,
        dueAt: isDraft ? null : addDays(issuedAt, PAYMENT_TERMS_DAYS[index % PAYMENT_TERMS_DAYS.length]),
        paidAt: invoice.paidAt == null ? null : addDays(issuedAt, 7 + (index % 14)),
        voidedAt: invoice.voidedAt == null ? null : addDays(issuedAt, 5),
        importedAt: issuedAt,
        updatedAt: issuedAt,
      }
    })
    .sort((a, b) => (b.sentAt?.getTime() ?? 0) - (a.sentAt?.getTime() ?? 0))
}

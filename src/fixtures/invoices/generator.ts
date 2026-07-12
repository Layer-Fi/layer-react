import { InvoiceStatus } from '@schemas/invoices/invoice'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { invoicePaymentTermsDays } from '@fixtures/invoices/constants'
import { schema } from '@fixtures/invoices/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { spreadDateAcrossYear } from '@fixtures/utils/spreadDateAcrossYear'

const DAY_MS = 24 * 60 * 60 * 1000

const generateInvoices = createGenerator(schema, {
  uniqueBy: [invoice => invoice.id],
  numRuns: 50,
  seed: 6,
})

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS)

const issuedAtAcrossYear = (index: number, total: number) => {
  const { year, month, day } = spreadDateAcrossYear(FIXTURE_YEAR, index, total)

  return new Date(Date.UTC(year, month - 1, day, 16, 30))
}

export const generator: typeof generateInvoices = (overrides) => {
  const invoices = generateInvoices(overrides)

  return invoices
    .map((invoice, index) => {
      const issuedAt = issuedAtAcrossYear(index, invoices.length)
      const isDraft = invoice.status === InvoiceStatus.Draft

      return {
        ...invoice,
        invoiceNumber: `INV-${String(1001 + index)}`,
        sentAt: isDraft ? null : issuedAt,
        dueAt: isDraft ? null : addDays(issuedAt, invoicePaymentTermsDays[index % invoicePaymentTermsDays.length]),
        paidAt: invoice.paidAt == null ? null : addDays(issuedAt, 7 + (index % 14)),
        voidedAt: invoice.voidedAt == null ? null : addDays(issuedAt, 5),
        importedAt: null,
        updatedAt: issuedAt,
      }
    })
    .sort((a, b) => (b.sentAt?.getTime() ?? 0) - (a.sentAt?.getTime() ?? 0))
}

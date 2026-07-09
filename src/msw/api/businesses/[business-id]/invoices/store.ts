import { createMockStore } from '@msw/utils/createMockStore'
import { invoices } from '@fixtures/generated/invoices.gen'

export const invoiceStore = createMockStore(() => invoices)

import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { Invoices } from '@features/invoices/Invoices/Invoices'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { handlers } from '@msw/handlers'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { invoices } from '@fixtures/generated/invoices.gen'
import { findEntryRows } from '@test-utils/storybook/findEntryRows'

const invoicesStoryHandlers = [
  getAccountingConfiguration.mock(makeAccountingConfiguration({ enableStripeOnboarding: true })),
  ...handlers,
]

const meta: Meta<typeof Invoices> = {
  title: 'Views/Invoices',
  tags: ['public-api'],
  component: Invoices,
  parameters: {
    msw: { handlers: invoicesStoryHandlers },
  },
}

export default meta

type Story = StoryObj<typeof Invoices>

export const Default: Story = {
  tags: ['docs-screenshot'],
}

// Cash sales carry `customer: null`, which leaves the detail view's customer and email blank, and
// one of those sorts to the top of the table. Prefer an individual over a company, since the view
// renders `companyName ?? individualName` and a person reads better in the docs. Derived from the
// fixtures rather than hardcoded so regenerating them can renumber the invoices freely.
const INVOICE_NUMBERS_WITH_NAMED_PERSON = invoices.flatMap(invoice =>
  invoice.customer?.individualName != null
  && invoice.customer.companyName == null
  && invoice.invoiceNumber !== null
    ? [invoice.invoiceNumber]
    : [],
)

const findInvoiceRowWithNamedPerson = (rows: ReadonlyArray<HTMLElement>) => {
  for (const row of rows) {
    const number = INVOICE_NUMBERS_WITH_NAMED_PERSON.find(value => row.textContent?.includes(value))
    if (number) return { row, number }
  }
  throw new Error('no invoice row for an individual customer is on the first page')
}

// A populated invoice, not the empty create form. Only the narrow layouts navigate to the
// detail view — the desktop table's rows aren't clickable — so this is a tablet story.
export const Detail: Story = {
  tags: ['docs-screenshot'],
  parameters: { chromatic: { viewports: [BREAKPOINTS.TABLET - 1] }, responseDelay: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { row, number } = findInvoiceRowWithNamedPerson(await findEntryRows(canvas))

    await userEvent.click(row)
    await canvas.findByText(`Invoice #${number}`, undefined, { timeout: 10_000 })
  },
}

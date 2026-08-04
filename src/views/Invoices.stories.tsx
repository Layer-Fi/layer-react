import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { Invoices } from '@features/invoices/Invoices/Invoices'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { handlers } from '@msw/handlers'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'

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

// A populated invoice, not the empty create form. Only the narrow layouts navigate to the
// detail view — the desktop table's rows aren't clickable — so this is a tablet story.
export const Detail: Story = {
  tags: ['docs-screenshot'],
  parameters: { chromatic: { viewports: [BREAKPOINTS.TABLET - 1] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Wait for invoices to land before clicking: the table re-renders as they arrive and
    // would detach the row. Click exactly once — a second click navigates back.
    const invoice = await canvas.findByText('INV-1048', undefined, { timeout: 15_000 })
    await userEvent.click(invoice)
    await canvas.findByText(/Invoice #INV-1048/, undefined, { timeout: 10_000 })
  },
}

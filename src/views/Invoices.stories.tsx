import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

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

export const Creation: Story = {
  tags: ['docs-screenshot'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Create Invoice' }))
  },
}

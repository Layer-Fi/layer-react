import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Invoices } from '@components/Invoices/Invoices'

const meta: Meta<typeof Invoices> = {
  title: 'Views/Invoices',
  component: Invoices,
}

export default meta

type Story = StoryObj<typeof Invoices>

export const Default: Story = {}

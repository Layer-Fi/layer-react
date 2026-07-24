import { type Meta, type StoryObj } from '@storybook/react-vite'
import { CreditCard } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { ActionableRow } from '@blocks/ActionableRow/ActionableRow'

const meta: Meta<typeof ActionableRow> = {
  title: 'Blocks/ActionableRow',
  component: ActionableRow,
}

export default meta

type Story = StoryObj<typeof ActionableRow>

const noop = () => {}

const label: React.CSSProperties = { fontSize: 12, opacity: 0.6 }

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, maxWidth: 480 }}>
      <span style={label}>title only</span>
      <ActionableRow title='Connect a bank account' />

      <span style={label}>title + description</span>
      <ActionableRow title='Connect a bank account' description='Link your account to import transactions.' />

      <span style={label}>icon + chevron action</span>
      <ActionableRow
        icon={<CreditCard size={16} />}
        title='Connect a bank account'
        description='Link your account to import transactions.'
        onClick={noop}
      />

      <span style={label}>custom button</span>
      <ActionableRow
        icon={<CreditCard size={16} />}
        title='Connect a bank account'
        description='Link your account to import transactions.'
        button={<Button variant='outlined'>Connect</Button>}
      />
    </div>
  ),
}

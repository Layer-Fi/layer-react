import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ActionableList, type ActionableListOption } from '@blocks/ActionableList/ActionableList'

const meta: Meta<typeof ActionableList> = {
  title: 'Blocks/ActionableList',
  component: ActionableList,
}

export default meta

type Story = StoryObj<typeof ActionableList<string>>

const noop = () => {}

const label: React.CSSProperties = { fontSize: 12, opacity: 0.6 }

const options: ActionableListOption<string>[] = [
  { id: 'checking', label: 'Business Checking', description: 'Chase •••• 1234', value: 'checking' },
  { id: 'savings', label: 'Business Savings', description: 'Chase •••• 5678', value: 'savings' },
  { id: 'card', label: 'Corporate Card', description: 'Amex •••• 9012', value: 'card' },
]

const linkOptions: ActionableListOption<string>[] = [
  { id: 'manage', label: 'Manage connections', value: 'manage', asLink: true },
  { id: 'add', label: 'Add another account', value: 'add', asLink: true, secondary: true },
]

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, maxWidth: 480 }}>
      <span style={label}>selectable, with descriptions</span>
      <ActionableList options={options} onClick={noop} selectedId='checking' showDescriptions />

      <span style={label}>selectable, labels only</span>
      <ActionableList options={options} onClick={noop} selectedId='savings' />

      <span style={label}>as links</span>
      <ActionableList options={linkOptions} onClick={noop} />
    </div>
  ),
}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ActionableList, type ActionableListOption } from '@blocks/ActionableList/ActionableList'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const meta: Meta<typeof ActionableList> = {
  title: 'Blocks/ActionableList',
  component: ActionableList,
}

export default meta

type Story = StoryObj<typeof ActionableList<string>>

const noop = () => {}

const options: ActionableListOption<string>[] = [
  { id: 'checking', label: 'Business Checking', description: 'Chase •••• 1234', value: 'checking' },
  { id: 'savings', label: 'Business Savings', description: 'Chase •••• 5678', value: 'savings' },
  { id: 'card', label: 'Corporate Card', description: 'Amex •••• 9012', value: 'card' },
]

const linkOptions: ActionableListOption<string>[] = [
  { id: 'manage', label: 'Manage connections', value: 'manage', asLink: true },
  { id: 'add', label: 'Add another account', value: 'add', asLink: true, secondary: true },
]

const CELLS: { label: string, props: React.ComponentProps<typeof ActionableList> }[] = [
  {
    label: 'selectable, with descriptions',
    props: { options, onClick: noop, selectedId: 'checking', showDescriptions: true },
  },
  { label: 'selectable, labels only', props: { options, onClick: noop, selectedId: 'savings' } },
  { label: 'as links', props: { options: linkOptions, onClick: noop } },
]

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery inlineSize={480}>
      {CELLS.map(({ label, props }) => (
        <Col key={label} label={label}>
          <ActionableList {...props} />
        </Col>
      ))}
    </Gallery>
  ),
}

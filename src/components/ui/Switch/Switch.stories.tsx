import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Switch } from '@ui/Switch/Switch'

import { Gallery, Row } from '@test-utils/storybook/gallery'

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  args: {
    children: 'Label',
  },
  argTypes: {
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Switch>

const CELLS: { label: string, props: React.ComponentProps<typeof Switch> }[] = [
  { label: 'off', props: { children: 'Off' } },
  { label: 'on', props: { children: 'On', isSelected: true } },
  { label: 'disabled off', props: { children: 'Disabled', isDisabled: true } },
  { label: 'disabled on', props: { children: 'Disabled', isSelected: true, isDisabled: true } },
  { label: 'invalid off', props: { children: 'Invalid', isInvalid: true } },
  { label: 'invalid on', props: { children: 'Invalid', isSelected: true, isInvalid: true } },
]

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={16}>
      {CELLS.map(({ label, props }) => (
        <Row key={label} label={label}>
          <Switch {...props} />
        </Row>
      ))}
    </Gallery>
  ),
}

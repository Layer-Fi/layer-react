import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PickerDropdownIndicator } from '@ui/PickerDropdownIndicator/PickerDropdownIndicator'

const meta: Meta<typeof PickerDropdownIndicator> = {
  title: 'UI/PickerDropdownIndicator',
  component: PickerDropdownIndicator,
}

export default meta

type Story = StoryObj<typeof PickerDropdownIndicator>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24 }}>
      <PickerDropdownIndicator />
    </div>
  ),
}

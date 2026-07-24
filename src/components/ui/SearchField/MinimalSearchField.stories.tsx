import { type Meta, type StoryObj } from '@storybook/react-vite'

import { MinimalSearchField } from '@ui/SearchField/MinimalSearchField'

const meta: Meta<typeof MinimalSearchField> = {
  title: 'UI/SearchField',
  component: MinimalSearchField,
  args: {
    'aria-label': 'Search',
    'placeholder': 'Search',
  },
  argTypes: {
    isDisabled: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof MinimalSearchField>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ width: 96, fontSize: 12, opacity: 0.6 }}>{label}</span>
    {children}
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 360 }}>
      <Row label='empty'>
        <MinimalSearchField aria-label='Empty' placeholder='Search' />
      </Row>
      <Row label='value'>
        <MinimalSearchField aria-label='Value' placeholder='Search' defaultValue='Query' />
      </Row>
      <Row label='disabled'>
        <MinimalSearchField aria-label='Disabled' placeholder='Search' defaultValue='Query' isDisabled />
      </Row>
    </div>
  ),
}

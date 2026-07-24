import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button, type ButtonVariant } from '@ui/Button/Button'

const VARIANTS: ButtonVariant[] = ['solid', 'ghost', 'outlined', 'text', 'branded']

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Button',
    variant: 'solid',
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    status: { control: 'select', options: [undefined, 'danger'] },
    isDisabled: { control: 'boolean' },
    isPending: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Button>

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      {VARIANTS.map(variant => (
        <Row key={variant} label={variant}>
          <Button variant={variant}>Default</Button>
          <Button variant={variant} isDisabled>Disabled</Button>
          <Button variant={variant} isPending>Pending</Button>
          <Button variant={variant} status='danger'>Danger</Button>
        </Row>
      ))}
    </div>
  ),
}

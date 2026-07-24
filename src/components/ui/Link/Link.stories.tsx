import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Link } from '@ui/Link/Link'

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const meta: Meta<typeof Link> = {
  title: 'UI/Link',
  component: Link,
  args: {
    children: 'Link',
    href: '#',
    size: 'md',
  },
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
}

export default meta

type Story = StoryObj<typeof Link>

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
      {SIZES.map(size => (
        <Row key={size} label={size}>
          <Link href='#' size={size}>Default</Link>
          <Link href='#' size={size} external>External</Link>
          <Link href='#' size={size} disabled>Disabled</Link>
        </Row>
      ))}
    </div>
  ),
}

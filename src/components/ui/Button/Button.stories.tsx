import { Fragment } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Star } from 'lucide-react'

import { Button, type ButtonVariant } from '@ui/Button/Button'

const VARIANTS: ButtonVariant[] = ['solid', 'ghost', 'outlined', 'text', 'branded']

const COLUMNS: { label: string, render: (variant: ButtonVariant) => React.ReactNode }[] = [
  { label: 'default', render: v => <Button variant={v}>Button</Button> },
  { label: 'disabled', render: v => <Button variant={v} isDisabled>Button</Button> },
  { label: 'pending', render: v => <Button variant={v} isPending>Button</Button> },
  { label: 'danger', render: v => <Button variant={v} status='danger'>Button</Button> },
  { label: 'icon only', render: v => <Button variant={v} icon aria-label='Favorite'><Star size={16} /></Button> },
  {
    label: 'icon and text',
    render: v => (
      <Button variant={v}>
        <Star size={16} />
        Button
      </Button>
    ),
  },
]

// The branded variant reads --bg/fg-brand-accent, which consumers override; the
// library sets no default. Supply a representative brand so the row is meaningful.
const BRAND_VARS = {
  '--bg-brand-accent': '#4a3aff',
  '--fg-brand-accent': '#ffffff',
} as React.CSSProperties

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

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div
      style={{
        ...BRAND_VARS,
        display: 'grid',
        gridTemplateColumns: `88px repeat(${COLUMNS.length}, max-content)`,
        gap: '16px 24px',
        alignItems: 'center',
        justifyItems: 'start',
        padding: 24,
      }}
    >
      <span />
      {COLUMNS.map(({ label }) => (
        <span key={label} style={{ fontSize: 12, opacity: 0.6 }}>{label}</span>
      ))}
      {VARIANTS.map(variant => (
        <Fragment key={variant}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{variant}</span>
          {COLUMNS.map(({ label, render }) => (
            <Fragment key={label}>{render(variant)}</Fragment>
          ))}
        </Fragment>
      ))}
    </div>
  ),
}

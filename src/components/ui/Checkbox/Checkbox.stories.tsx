import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Checkbox } from '@ui/Checkbox/Checkbox'

const VARIANTS = ['default', 'round', 'error', 'branded'] as const
const SIZES = ['sm', 'md', 'lg'] as const

// The branded variant reads --bg/fg-brand-accent, which consumers override; the
// library sets no default. Supply a representative brand so the row is meaningful.
const BRAND_VARS = {
  '--bg-brand-accent': '#4a3aff',
  '--fg-brand-accent': '#ffffff',
} as React.CSSProperties

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  args: {
    children: 'Label',
    variant: 'default',
    size: 'sm',
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: SIZES },
    isSelected: { control: 'boolean' },
    isIndeterminate: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Checkbox>

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ width: 96, fontSize: 12, opacity: 0.6 }}>{label}</span>
    {children}
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ ...BRAND_VARS, display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      {SIZES.map(size => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{`size: ${size}`}</span>
          {VARIANTS.map(variant => (
            <Row key={variant} label={variant}>
              <Checkbox variant={variant} size={size}>Unchecked</Checkbox>
              <Checkbox variant={variant} size={size} isSelected>Checked</Checkbox>
              <Checkbox variant={variant} size={size} isIndeterminate>Mixed</Checkbox>
              <Checkbox variant={variant} size={size} isSelected isDisabled>Disabled</Checkbox>
            </Row>
          ))}
        </div>
      ))}
    </div>
  ),
}

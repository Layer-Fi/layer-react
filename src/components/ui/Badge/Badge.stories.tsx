import { Fragment } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Check } from 'lucide-react'

import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'

const VARIANTS = Object.values(BadgeVariant)
const SIZES = Object.values(BadgeSize)

const noop = () => {}

const label: React.CSSProperties = { fontSize: 12, opacity: 0.6 }

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  args: {
    children: 'Badge',
    variant: BadgeVariant.DEFAULT,
    size: BadgeSize.MEDIUM,
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: SIZES },
  },
}

export default meta

type Story = StoryObj<typeof Badge>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `72px repeat(${SIZES.length + 4}, max-content)`,
        gap: '12px 20px',
        alignItems: 'center',
        justifyItems: 'start',
        padding: 24,
      }}
    >
      <span />
      {SIZES.map(size => <span key={size} style={label}>{size}</span>)}
      <span style={label}>icon</span>
      <span style={label}>icon right</span>
      <span style={label}>icon only</span>
      <span style={label}>clickable</span>
      {VARIANTS.map(variant => (
        <Fragment key={variant}>
          <span style={label}>{variant}</span>
          {SIZES.map(size => (
            <Badge key={size} variant={variant} size={size}>Badge</Badge>
          ))}
          <Badge variant={variant} icon={<Check size={12} />}>Icon</Badge>
          <Badge variant={variant} icon={<Check size={12} />} iconPosition='right'>Right</Badge>
          <Badge variant={variant} icon={<Check size={12} />} iconOnly />
          <Badge variant={variant} onClick={noop}>Click</Badge>
        </Fragment>
      ))}
    </div>
  ),
}

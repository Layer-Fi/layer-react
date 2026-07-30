import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Check } from 'lucide-react'

import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'

import { Gallery, Matrix } from '@test-utils/storybook/gallery'

const VARIANTS = Object.values(BadgeVariant)
const SIZES = Object.values(BadgeSize)

const noop = () => {}

type Column = { label: string, render: (variant: BadgeVariant) => React.ReactNode }

const COLUMNS: Column[] = [
  ...SIZES.map(size => ({
    label: size,
    render: (variant: BadgeVariant) => <Badge variant={variant} size={size}>Badge</Badge>,
  })),
  { label: 'icon', render: variant => <Badge variant={variant} icon={<Check size={12} />}>Icon</Badge> },
  { label: 'icon right', render: variant => <Badge variant={variant} icon={<Check size={12} />} iconPosition='right'>Right</Badge> },
  { label: 'icon only', render: variant => <Badge variant={variant} icon={<Check size={12} />} iconOnly /> },
  { label: 'clickable', render: variant => <Badge variant={variant} onClick={noop}>Click</Badge> },
]

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
    <Gallery>
      <Matrix
        rows={VARIANTS}
        columns={COLUMNS}
        rowLabel={variant => variant}
        columnLabel={column => column.label}
        renderCell={(variant, column) => column.render(variant)}
        labelColumnSize={72}
        gap='12px 20px'
      />
    </Gallery>
  ),
}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BadgeLoader } from '@ui/Badge/BadgeLoader'

import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Matrix } from '@testUtils/storybook/layout/Matrix'

const VARIANTS = ['default', 'info', 'success', 'error', 'warning'] as const

const COLUMNS = [
  { label: 'resting', showLoading: false },
  { label: 'loading', showLoading: true },
]

const meta: Meta<typeof BadgeLoader> = {
  title: 'UI/BadgeLoader',
  component: BadgeLoader,
  args: {
    variant: 'default',
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    showLoading: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof BadgeLoader>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery>
      <Matrix
        rows={VARIANTS}
        columns={COLUMNS}
        rowLabel={variant => variant}
        columnLabel={column => column.label}
        renderCell={(variant, { showLoading }) => (
          <BadgeLoader variant={variant} showLoading={showLoading} />
        )}
        labelColumnSize={72}
        gap='12px 24px'
      />
    </Gallery>
  ),
}

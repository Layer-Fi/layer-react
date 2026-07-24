import { Fragment } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BadgeLoader } from '@ui/Badge/BadgeLoader'

const VARIANTS = ['default', 'info', 'success', 'error', 'warning'] as const

const label: React.CSSProperties = { fontSize: 12, opacity: 0.6 }

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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '72px max-content max-content',
        gap: '12px 24px',
        alignItems: 'center',
        justifyItems: 'start',
        padding: 24,
      }}
    >
      <span />
      <span style={label}>resting</span>
      <span style={label}>loading</span>
      {VARIANTS.map(variant => (
        <Fragment key={variant}>
          <span style={label}>{variant}</span>
          <BadgeLoader variant={variant} />
          <BadgeLoader variant={variant} showLoading />
        </Fragment>
      ))}
    </div>
  ),
}

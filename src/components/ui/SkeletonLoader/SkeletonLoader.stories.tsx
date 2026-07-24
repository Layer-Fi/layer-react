import { type Meta, type StoryObj } from '@storybook/react-vite'

import { CircleSkeletonLoader, SkeletonLoader } from '@ui/SkeletonLoader/SkeletonLoader'

const label: React.CSSProperties = { fontSize: 12, opacity: 0.6 }

const meta: Meta<typeof SkeletonLoader> = {
  title: 'UI/SkeletonLoader',
  component: SkeletonLoader,
}

export default meta

type Story = StoryObj<typeof SkeletonLoader>

const cell: React.CSSProperties = { display: 'grid', gap: 8, justifyItems: 'start' }

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: 24 }}>
      <div style={cell}>
        <span style={label}>line</span>
        <SkeletonLoader width='240px' height='12px' />
      </div>
      <div style={cell}>
        <span style={label}>block</span>
        <SkeletonLoader width='160px' height='80px' />
      </div>
      <div style={cell}>
        <span style={label}>tall</span>
        <SkeletonLoader width='80px' height='160px' />
      </div>
      <div style={cell}>
        <span style={label}>circle</span>
        <CircleSkeletonLoader width='64px' height='64px' />
      </div>
    </div>
  ),
}

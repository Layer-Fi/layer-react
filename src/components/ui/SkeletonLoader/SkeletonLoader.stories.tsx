import { type Meta, type StoryObj } from '@storybook/react-vite'

import { CircleSkeletonLoader, SkeletonLoader } from '@ui/SkeletonLoader/SkeletonLoader'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const meta: Meta<typeof SkeletonLoader> = {
  title: 'UI/SkeletonLoader',
  component: SkeletonLoader,
}

export default meta

type Story = StoryObj<typeof SkeletonLoader>

const CELLS: {
  label: string
  Component: typeof SkeletonLoader
  width: string
  height: string
}[] = [
  { label: 'line', Component: SkeletonLoader, width: '240px', height: '12px' },
  { label: 'block', Component: SkeletonLoader, width: '160px', height: '80px' },
  { label: 'tall', Component: SkeletonLoader, width: '80px', height: '160px' },
  { label: 'circle', Component: CircleSkeletonLoader, width: '64px', height: '64px' },
]

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery direction='row' wrap gap={40}>
      {CELLS.map(({ label, Component, width, height }) => (
        <Col key={label} label={label}>
          <Component width={width} height={height} />
        </Col>
      ))}
    </Gallery>
  ),
}

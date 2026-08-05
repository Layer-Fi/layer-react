import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Link } from '@ui/Link/Link'

import { Gallery, Row } from '@testUtils/storybook/layout/gallery'

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

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={16}>
      {SIZES.map(size => (
        <Row key={size} label={size}>
          <Link href='#' size={size}>Default</Link>
          <Link href='#' size={size} external>External</Link>
          <Link href='#' size={size} disabled>Disabled</Link>
        </Row>
      ))}
    </Gallery>
  ),
}

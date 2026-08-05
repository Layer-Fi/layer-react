import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Heading, type HeadingSize } from '@ui/Typography/Heading'
import { P, Span } from '@ui/Typography/Text'

import { Gallery, Row as BaseRow } from '@testUtils/storybook/layout/gallery'

const HEADING_SIZES: HeadingSize[] = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
const TEXT_SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl'] as const
const STATUSES = ['error', 'success', 'warning', 'disabled', 'info'] as const
const VARIANTS = ['placeholder', 'subtle', 'inherit'] as const

const meta: Meta = {
  title: 'UI/Typography',
}

export default meta

type Story = StoryObj

const Group = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
)

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <BaseRow label={label} align='baseline'>{children}</BaseRow>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery>
      <Group>
        {HEADING_SIZES.map(size => (
          <Row key={size} label={`heading ${size}`}>
            <Heading size={size}>{`Heading ${size}`}</Heading>
          </Row>
        ))}
      </Group>
      <Group>
        {TEXT_SIZES.map(size => (
          <Row key={size} label={`span ${size}`}>
            <Span size={size}>The quick brown fox</Span>
          </Row>
        ))}
      </Group>
      <Group>
        {STATUSES.map(status => (
          <Row key={status} label={status}>
            <Span status={status}>{`Status ${status}`}</Span>
          </Row>
        ))}
      </Group>
      <Group>
        {VARIANTS.map(variant => (
          <Row key={variant} label={variant}>
            <Span variant={variant}>{`Variant ${variant}`}</Span>
          </Row>
        ))}
        <Row label='bold'>
          <Span weight='bold'>Bold text</Span>
        </Row>
      </Group>
      <P>Paragraph text rendered with the P component.</P>
    </Gallery>
  ),
}

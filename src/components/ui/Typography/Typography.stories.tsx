import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Heading, type HeadingSize } from '@ui/Typography/Heading'
import { P, Span } from '@ui/Typography/Text'

const HEADING_SIZES: HeadingSize[] = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
const TEXT_SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl'] as const
const STATUSES = ['error', 'success', 'warning', 'disabled', 'info'] as const
const VARIANTS = ['placeholder', 'subtle', 'inherit'] as const

const meta: Meta = {
  title: 'UI/Typography',
}

export default meta

type Story = StoryObj

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
    <span style={{ width: 96, fontSize: 12, opacity: 0.6 }}>{label}</span>
    {children}
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {HEADING_SIZES.map(size => (
          <Row key={size} label={`heading ${size}`}>
            <Heading size={size}>{`Heading ${size}`}</Heading>
          </Row>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TEXT_SIZES.map(size => (
          <Row key={size} label={`span ${size}`}>
            <Span size={size}>The quick brown fox</Span>
          </Row>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STATUSES.map(status => (
          <Row key={status} label={status}>
            <Span status={status}>{`Status ${status}`}</Span>
          </Row>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {VARIANTS.map(variant => (
          <Row key={variant} label={variant}>
            <Span variant={variant}>{`Variant ${variant}`}</Span>
          </Row>
        ))}
        <Row label='bold'>
          <Span weight='bold'>Bold text</Span>
        </Row>
      </div>
      <P>Paragraph text rendered with the P component.</P>
    </div>
  ),
}

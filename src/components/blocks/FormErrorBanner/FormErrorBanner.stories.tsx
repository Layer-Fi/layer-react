import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FormErrorBanner } from '@blocks/FormErrorBanner/FormErrorBanner'

const SHORT = 'Something went wrong. Please try again.'
const LONG = 'Please enter a valid amount before submitting this form. Amounts must be greater than zero and use no more than two decimal places.'

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  opacity: 0.55,
}

// The banner lays out inline, so container width is what changes how it reads: the
// message wraps while the icon holds its square.
const CELLS: { label: string, message: string, inlineSize: number }[] = [
  { label: 'default', message: SHORT, inlineSize: 480 },
  { label: 'wrapping message', message: LONG, inlineSize: 480 },
  { label: 'narrow container', message: LONG, inlineSize: 280 },
]

const meta: Meta<typeof FormErrorBanner> = {
  title: 'Blocks/FormErrorBanner',
  component: FormErrorBanner,
  args: { message: SHORT },
}

export default meta

type Story = StoryObj<typeof FormErrorBanner>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      {CELLS.map(({ label, message, inlineSize }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={LABEL}>{label}</span>
          <div style={{ inlineSize, border: '1px dotted rgb(0 0 0 / 24%)', borderRadius: 8 }}>
            <FormErrorBanner message={message} />
          </div>
        </div>
      ))}
    </div>
  ),
}

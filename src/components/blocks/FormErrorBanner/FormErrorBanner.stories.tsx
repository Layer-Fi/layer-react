import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FormErrorBanner } from '@blocks/FormErrorBanner/FormErrorBanner'

import { Col } from '@testUtils/storybook/layout/Col'
import { Frame } from '@testUtils/storybook/layout/Frame'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const SHORT = 'Something went wrong. Please try again.'
const LONG = 'Amounts must be greater than zero and use no more than two decimal places.'

type Cell = {
  label: string
  message: string
  slotProps?: React.ComponentProps<typeof FormErrorBanner>['slotProps']
}

const CELLS: Cell[] = [
  { label: 'default', message: SHORT },
  { label: 'truncated message', message: LONG },
  { label: 'wrapping title', message: LONG, slotProps: { Title: { ellipsis: false } } },
  { label: 'large title', message: SHORT, slotProps: { Title: { size: 'lg' } } },
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
    <Gallery>
      {CELLS.map(({ label, message, slotProps }) => (
        <Col key={label} label={label}>
          <Frame inlineSize={480} padding={0}>
            <div style={{ paddingBlockEnd: 16 }}>
              <FormErrorBanner message={message} slotProps={slotProps} />
            </div>
          </Frame>
        </Col>
      ))}
    </Gallery>
  ),
}

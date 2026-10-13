import { type ComponentProps } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { CsvUpload } from '@blocks/CsvUpload/CsvUpload/CsvUpload'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const CSV_FILE = new File(['date,description,amount\n'.repeat(1200)], 'transactions-september.csv', { type: 'text/csv' })

const VARIANTS: ReadonlyArray<{ label: string, props: Partial<ComponentProps<typeof CsvUpload>> }> = [
  { label: 'default', props: {} },
  { label: 'file chosen', props: { file: CSV_FILE } },
]

const meta: Meta<typeof CsvUpload> = {
  title: 'Blocks/CsvUpload',
  component: CsvUpload,
  args: { file: null, onFileSelected: () => {} },
}

export default meta

type Story = StoryObj<typeof CsvUpload>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Gallery direction='row' wrap gap={32}>
      {VARIANTS.map(({ label, props }) => (
        <Col key={label} label={label} inlineSize={520}>
          <CsvUpload {...args} {...props} />
        </Col>
      ))}
    </Gallery>
  ),
}

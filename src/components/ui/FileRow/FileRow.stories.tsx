import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FileRow, type FileRowProps } from '@ui/FileRow/FileRow'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const noop = () => {}

const VARIANTS: ReadonlyArray<{ label: string, props: FileRowProps }> = [
  { label: 'uploaded', props: { name: 'office-supplies-receipt.pdf', sizeInBytes: 248_000, onRemove: noop } },
  { label: 'uploaded, replaceable', props: { name: 'office-supplies-receipt.pdf', sizeInBytes: 248_000, onReplace: noop, onRemove: noop } },
  { label: 'uploading', props: { name: 'office-supplies-receipt.pdf', sizeInBytes: 248_000, isUploading: true } },
  { label: 'removing', props: { name: 'office-supplies-receipt.pdf', sizeInBytes: 248_000, isRemoving: true, onRemove: noop } },
  { label: 'read only', props: { name: 'office-supplies-receipt.pdf', sizeInBytes: 248_000 } },
  { label: 'disabled', props: { name: 'office-supplies-receipt.pdf', sizeInBytes: 248_000, isDisabled: true, onRemove: noop } },
  { label: 'long name truncates', props: { name: 'Screenshot 2026-10-09 at 10.49.39 AM.png', sizeInBytes: 1_200_000, onRemove: noop } },
]

const meta: Meta<typeof FileRow> = {
  title: 'UI/FileRow',
  component: FileRow,
  args: { name: 'office-supplies-receipt.pdf', sizeInBytes: 248_000 },
}

export default meta

type Story = StoryObj<typeof FileRow>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery direction='row' wrap gap={32}>
      {VARIANTS.map(({ label, props }) => (
        <Col key={label} label={label} inlineSize={380}>
          <FileRow {...props} />
        </Col>
      ))}
    </Gallery>
  ),
}

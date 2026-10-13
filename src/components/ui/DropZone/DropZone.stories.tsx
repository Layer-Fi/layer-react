import { type Meta, type StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

import { DropZone, type DropZoneProps } from '@ui/DropZone/DropZone'
import { FileRow } from '@ui/FileRow/FileRow'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const BASE: DropZoneProps = {
  title: 'Drag a file here',
  description: 'PDF, PNG, or JPG · Up to 10 MB',
  accept: ['pdf', 'png', 'jpg'],
  actionLabel: 'Choose file',
  onDrop: () => {},
}

const VARIANTS: ReadonlyArray<{ label: string, props?: Partial<DropZoneProps> }> = [
  { label: 'default' },
  { label: 'invalid', props: { isInvalid: true } },
  { label: 'disabled', props: { isDisabled: true } },
  { label: 'touch — whole zone is the tap target', props: { title: 'Add a receipt', description: 'Photo or PDF · Up to 10 MB', actionLabel: undefined } },
  { label: 'any file type', props: { title: 'Drag files here', description: 'Any file type · Up to 25 MB each', accept: [], actionLabel: 'Choose files' } },
  {
    label: 'large',
    props: {
      size: 'lg',
      title: 'Upload a CSV of transactions',
      description: 'Drag a file here or choose one from your computer. Up to 2 MB.',
      accept: ['csv'],
      actionLabel: 'Choose CSV',
    },
  },
]

const meta: Meta<typeof DropZone> = {
  title: 'UI/DropZone',
  component: DropZone,
  args: BASE,
}

export default meta

type Story = StoryObj<typeof DropZone>

const dragFileOver = (element: HTMLElement) => {
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(new File(['content'], 'office-supplies-receipt.pdf', { type: 'application/pdf' }))
  element.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }))
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Gallery direction='row' wrap gap={32}>
      {VARIANTS.map(({ label, props }) => (
        <Col key={label} label={label} inlineSize={420}>
          <DropZone {...args} {...props} />
        </Col>
      ))}
      <Col label='custom body — a file row that accepts a replacement' inlineSize={420}>
        <DropZone {...args}>
          {({ open }) => <FileRow name='office-supplies-receipt.pdf' sizeInBytes={248_000} isGrouped onReplace={open} onRemove={() => {}} />}
        </DropZone>
      </Col>
    </Gallery>
  ),
}

export const DragOver: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    dragFileOver(canvas.getByText('Drag a file here'))

    await canvas.findByText('Drop to upload')
  },
  render: args => (
    <Gallery>
      <Col label='drag over' inlineSize={420}>
        <DropZone {...args} />
      </Col>
    </Gallery>
  ),
}

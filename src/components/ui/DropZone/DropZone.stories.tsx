import { type Meta, type StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

import { Button } from '@ui/Button/Button'
import { DropZone, type DropZoneProps } from '@ui/DropZone/DropZone'
import { FileRow } from '@ui/FileRow/FileRow'
import { Span } from '@ui/Typography/Text'

import { dragFileOver } from '@testUtils/storybook/interactions/dragFiles'
import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const BASE: DropZoneProps = {
  title: 'Drag a file here',
  description: 'PDF, PNG, or JPG · Up to 10 MB',
  accept: ['pdf', 'png', 'jpg'],
  actionLabel: 'Choose file',
  rejectDescription: 'Use a PDF, PNG, or JPG',
  onDrop: () => {},
}

const VARIANTS: ReadonlyArray<{ label: string, props?: Partial<DropZoneProps> }> = [
  { label: 'default' },
  { label: 'invalid', props: { isInvalid: true } },
  { label: 'disabled', props: { isDisabled: true } },
  { label: 'touch — whole zone is the tap target', props: { title: 'Add a receipt', description: 'Photo or PDF · Up to 10 MB', actionLabel: undefined } },
  { label: 'any file type', props: { title: 'Drag files here', description: 'Any file type · Up to 25 MB each', accept: [], actionLabel: 'Choose files' } },
  {
    label: 'large, with actions and footer',
    props: {
      size: 'lg',
      title: 'Upload a CSV of transactions',
      description: 'Drag a file here or choose one from your computer. Up to 2 MB.',
      accept: ['csv'],
      actionLabel: 'Choose CSV',
      slots: {
        Actions: <Button variant='ghost'>Download template</Button>,
        Footer: <Span size='sm' variant='subtle'>Required columns: Date, Description, Amount</Span>,
      },
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

/** Drag feedback is react-dropzone state, so it is reached by dispatching a drag rather than through props. */
export const DragStates: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [acceptZone, rejectZone] = canvas.getAllByText('Drag a file here')
    if (!acceptZone || !rejectZone) throw new Error('Expected two drop zones')

    dragFileOver(acceptZone, 'application/pdf')
    dragFileOver(rejectZone, 'application/zip')

    await canvas.findByText('Drop to upload')
    await canvas.findByText('This file type isn’t supported')
  },
  render: args => (
    <Gallery direction='row' wrap gap={32}>
      <Col label='drag over' inlineSize={420}>
        <DropZone {...args} />
      </Col>
      <Col label='drag reject' inlineSize={420}>
        <DropZone {...args} />
      </Col>
    </Gallery>
  ),
}

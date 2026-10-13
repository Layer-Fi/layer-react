import { type Meta, type StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

import { DropZone, type DropZoneProps } from '@ui/DropZone/DropZone'
import { type DropZonePromptProps } from '@ui/DropZone/DropZonePrompt'
import { FileRow } from '@ui/FileRow/FileRow'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const PROMPT: DropZonePromptProps = {
  title: 'Drag and drop a file here',
  description: 'PDF, PNG, or JPG · Up to 10 MB',
  actionLabel: 'Choose file',
}

const BASE: DropZoneProps = {
  prompt: PROMPT,
  accept: ['pdf', 'png', 'jpg'],
  onDrop: () => {},
}

const VARIANTS: ReadonlyArray<{ label: string, props?: Partial<DropZoneProps> }> = [
  { label: 'default' },
  { label: 'invalid', props: { isInvalid: true } },
  { label: 'disabled', props: { isDisabled: true } },
  { label: 'touch — whole zone is the tap target', props: { prompt: { title: 'Add a receipt', description: 'Photo or PDF · Up to 10 MB' } } },
  { label: 'any file type', props: { prompt: { title: 'Drag and drop files here', description: 'Any file type · Up to 25 MB each', actionLabel: 'Choose files' }, accept: [] } },
  {
    label: 'large',
    props: {
      size: 'lg',
      prompt: {
        title: 'Upload a CSV of your transactions',
        description: 'Drag and drop a file here or select one from your computer.',
        actionLabel: 'Browse',
      },
      accept: ['csv'],
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

const DRAG_OVER_TITLE = 'Drag and drop a receipt here'

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    dragFileOver(canvas.getByText(DRAG_OVER_TITLE))

    await canvas.findByText('Drop to upload')
  },
  render: args => (
    <Gallery direction='row' wrap gap={32}>
      {VARIANTS.map(({ label, props }) => (
        <Col key={label} label={label} inlineSize={420}>
          <DropZone {...args} {...props} />
        </Col>
      ))}
      <Col label='drag over' inlineSize={420}>
        <DropZone {...args} prompt={{ ...PROMPT, title: DRAG_OVER_TITLE }} />
      </Col>
      <Col label='filled — a file row that accepts a replacement' inlineSize={420}>
        <DropZone {...args} prompt={undefined}>
          {({ open }) => <FileRow name='office-supplies-receipt.pdf' sizeInBytes={248_000} onReplace={open} onRemove={() => {}} />}
        </DropZone>
      </Col>
      <Col label='filled with room for more' inlineSize={420}>
        <DropZone {...args} multiple prompt={{ ...PROMPT, title: 'Drag and drop more files here', actionLabel: 'Add files' }}>
          {() => <FileRow name='office-supplies-receipt.pdf' sizeInBytes={248_000} onRemove={() => {}} />}
        </DropZone>
      </Col>
      <Col label='filled, invalid' inlineSize={420}>
        <DropZone {...args} prompt={undefined} isInvalid>
          {({ open }) => <FileRow name='office-supplies-receipt.pdf' sizeInBytes={248_000} onReplace={open} onRemove={() => {}} />}
        </DropZone>
      </Col>
    </Gallery>
  ),
}

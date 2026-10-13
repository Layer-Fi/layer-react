import { type Meta, type StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

import { Button } from '@ui/Button/Button'
import { DropZone } from '@ui/DropZone/DropZone'
import { FileRow } from '@ui/FileRow/FileRow'
import { Span } from '@ui/Typography/Text'
import { CsvUpload } from '@blocks/CsvUpload/CsvUpload/CsvUpload'
import { FormFileUploadField, type FormFileUploadFieldProps, type UploadedFile } from '@blocks/Form/FormFileUploadField'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { dragFileOver } from '@testUtils/storybook/interactions/dragFiles'
import { Col } from '@testUtils/storybook/layout/Col'
import { type FormFieldVariant, FormFieldVariantGallery } from '@testUtils/storybook/layout/formField'
import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Section } from '@testUtils/storybook/layout/Section'

const LABEL = 'Receipts'
const ACCEPT = ['pdf', 'png', 'jpg']
const MAX_FILE_SIZE_IN_BYTES = 10_000_000
const ADDED_AT = new Date(FIXTURE_YEAR, 9, 9)
const noop = () => {}

const RECEIPT: UploadedFile = { id: 'receipt', name: 'office-supplies-receipt.pdf', sizeInBytes: 248_000, addedAt: ADDED_AT, href: '#receipt' }
const SCREENSHOT: UploadedFile = { id: 'screenshot', name: 'Screenshot 2026-10-09 at 10.49.39 AM.png', sizeInBytes: 1_200_000, addedAt: ADDED_AT }
const GUIDE: UploadedFile = { id: 'guide', name: 'In-Office Guide.pdf', sizeInBytes: 312_000, addedAt: ADDED_AT }
const API_RECEIPT: UploadedFile = { id: 'receipt', name: 'office-supplies-receipt.pdf' }

const CSV_FILE = new File(['date,description,amount\n'.repeat(1200)], 'transactions-september.csv', { type: 'text/csv' })

const upload = (files: ReadonlyArray<File>) =>
  new Promise<ReadonlyArray<UploadedFile>>(resolve =>
    setTimeout(() => resolve(files.map(({ name }) => ({ id: crypto.randomUUID(), name }))), 600),
  )

type Variant = FormFieldVariant<UploadedFile[], FormFileUploadFieldProps>

const FieldGallery = ({ variants }: { variants: ReadonlyArray<Variant> }) => (
  <FormFieldVariantGallery
    defaultValue={[]}
    variants={variants}
    inlineSize={420}
    renderField={props => (
      <FormFileUploadField label={LABEL} accept={ACCEPT} maxFileSizeInBytes={MAX_FILE_SIZE_IN_BYTES} upload={upload} {...props} />
    )}
  />
)

const INTERACTION_VARIANTS: ReadonlyArray<Variant> = [
  { label: 'default — hover and tab to the button for hover and focus' },
  { label: 'disabled', props: { isDisabled: true } },
]

const VALIDATION_VARIANTS: ReadonlyArray<Variant> = [
  { label: 'invalid', errorText: 'Upload a receipt to continue.' },
  { label: 'invalid, error hidden', errorText: 'Upload a receipt to continue.', props: { showFieldError: false } },
  { label: 'overridden error text', errorText: 'office-supplies-receipt.pdf is 14 MB. Files must be under 10 MB.' },
]

const WITH_FILES_VARIANTS: ReadonlyArray<Variant> = [
  { label: 'single, uploaded — drop on the row to replace', value: [RECEIPT] },
  { label: 'multiple, up to 3', value: [SCREENSHOT, GUIDE], props: { multiple: true, maxFiles: 3 } },
  { label: 'multiple, at limit', value: [SCREENSHOT, GUIDE, RECEIPT], props: { multiple: true, maxFiles: 3 } },
]

const FILLED_VARIANTS: ReadonlyArray<Variant> = [
  { label: 'read only, already filled', value: [SCREENSHOT, GUIDE, RECEIPT], props: { isReadOnly: true, multiple: true } },
  { label: 'read only, single already filled', value: [RECEIPT], props: { isReadOnly: true } },
  { label: 'read only, nothing uploaded', props: { isReadOnly: true } },
  { label: 'read only, today’s API data (name only)', value: [API_RECEIPT], props: { isReadOnly: true } },
  { label: 'disabled, already filled', value: [SCREENSHOT, GUIDE], props: { isDisabled: true, multiple: true, maxFiles: 3 } },
  { label: 'disabled, single already filled', value: [RECEIPT], props: { isDisabled: true } },
]

const LAYOUT_VARIANTS: ReadonlyArray<Variant> = [
  { label: 'any file type', props: { accept: [], multiple: true, maxFileSizeInBytes: 25_000_000 } },
  { label: 'multiple, count shown up front', props: { multiple: true, maxFiles: 3, maxFileSizeInBytes: undefined } },
  { label: 'inline', props: { inline: true } },
]

const meta: Meta = {
  title: 'Blocks/Scratch/Dropzone revised',
  parameters: { chromatic: { viewports: [1280] } },
}

export default meta

type Story = StoryObj

export const Review: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [acceptZone, rejectZone] = canvas.getAllByText('Drag to preview')
    if (!acceptZone || !rejectZone) throw new Error('Expected the two drag preview zones')

    dragFileOver(acceptZone, 'application/pdf')
    dragFileOver(rejectZone, 'application/zip')
    await canvas.findByText('Drop to upload')
  },
  render: () => (
    <Gallery gap={40}>
      <Section title='Interaction states'>
        <FieldGallery variants={INTERACTION_VARIANTS} />
        <Gallery direction='row' wrap gap={32} padding={0}>
          {(['drag over', 'drag reject'] as const).map(label => (
            <Col key={label} label={label} inlineSize={420}>
              <DropZone title='Drag to preview' description='PDF, PNG, or JPG · Up to 10 MB' accept={ACCEPT} actionLabel='Choose file' rejectDescription='Use a PDF, PNG, or JPG' onDrop={noop} />
            </Col>
          ))}
        </Gallery>
      </Section>

      <Section title='Validation'>
        <FieldGallery variants={VALIDATION_VARIANTS} />
      </Section>

      <Section title='With files'>
        <FieldGallery variants={WITH_FILES_VARIANTS} />
        <Gallery direction='row' wrap gap={32} padding={0}>
          <Col label='uploading' inlineSize={420}>
            <FileRow name={RECEIPT.name} sizeInBytes={RECEIPT.sizeInBytes} status='uploading' onRemove={noop} />
          </Col>
          <Col label='upload failed — error and retry on the row' inlineSize={420}>
            <FileRow name={RECEIPT.name} status='failed' onRetry={noop} onRemove={noop} />
          </Col>
        </Gallery>
      </Section>

      <Section title='Read only and disabled, already filled'>
        <FieldGallery variants={FILLED_VARIANTS} />
      </Section>

      <Section title='Layout options'>
        <FieldGallery variants={LAYOUT_VARIANTS} />
        <Gallery direction='row' wrap gap={32} padding={0}>
          <Col label='touch — whole zone is the tap target (mobile width renders this)' inlineSize={320}>
            <DropZone title='Add a receipt' description='Photo or PDF · Up to 10 MB' accept={ACCEPT} onDrop={noop} />
          </Col>
        </Gallery>
      </Section>

      <Section title='Large · custom transactions upload'>
        <Gallery direction='row' wrap gap={32} padding={0}>
          <Col label='default' inlineSize={560}>
            <CsvUpload
              file={null}
              onFileSelected={noop}
              slots={{
                Actions: <Button variant='ghost'>Download template</Button>,
                Footer: <Span size='sm' variant='subtle'>Required columns: Date, Description, Amount</Span>,
              }}
            />
          </Col>
          <Col label='file chosen — drop on the row to replace' inlineSize={560}>
            <CsvUpload file={CSV_FILE} onFileSelected={noop} replaceDropTarget />
          </Col>
        </Gallery>
      </Section>
    </Gallery>
  ),
}

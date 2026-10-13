import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BREAKPOINTS } from '@utils/shared/size/screenSizeBreakpoints'
import { FormFileUploadField, type FormFileUploadFieldProps, type UploadedFile } from '@blocks/Form/FormFileUploadField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@testUtils/storybook/layout/formField'

const LABEL = 'Receipts'
const ACCEPT = ['pdf', 'png', 'jpg', 'csv']

const RECEIPT: UploadedFile = { id: 'receipt', name: 'office-supplies-receipt.pdf', sizeInBytes: 248_000 }
const SCREENSHOT: UploadedFile = { id: 'screenshot', name: 'Screenshot 2026-10-09 at 10.49.39 AM.png', sizeInBytes: 1_200_000 }
const GUIDE: UploadedFile = { id: 'guide', name: 'In-Office Guide.pdf', sizeInBytes: 312_000 }

const UPLOADED: UploadedFile[] = [RECEIPT]
const TWO_UPLOADED: UploadedFile[] = [SCREENSHOT, GUIDE]
const THREE_UPLOADED: UploadedFile[] = [SCREENSHOT, GUIDE, RECEIPT]

const UPLOAD_DELAY_MS = 600

const upload = (files: ReadonlyArray<File>) =>
  new Promise<ReadonlyArray<UploadedFile>>(resolve =>
    setTimeout(() => resolve(files.map(({ name }) => ({ id: crypto.randomUUID(), name }))), UPLOAD_DELAY_MS),
  )

type Variant = FormFieldVariant<UploadedFile[], FormFileUploadFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'single, uploaded', value: UPLOADED },
  { label: 'multiple, up to 3', props: { multiple: true, maxFiles: 3 } },
  { label: 'multiple, uploaded', value: TWO_UPLOADED, props: { multiple: true, maxFiles: 3 } },
  { label: 'multiple, at limit', value: THREE_UPLOADED, props: { multiple: true, maxFiles: 3 } },
  { label: 'any file type', props: { accept: [], multiple: true, maxFileSizeInBytes: 25_000_000 } },
  { label: 'read only, uploaded', value: THREE_UPLOADED, props: { isReadOnly: true, multiple: true } },
  { label: 'disabled, uploaded', value: TWO_UPLOADED, props: { isDisabled: true, multiple: true, maxFiles: 3 } },
]

const meta: Meta<typeof FormFileUploadField> = {
  title: 'Blocks/Form/FormFileUploadField',
  component: FormFileUploadField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormFileUploadField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue={[]}
      variants={VARIANTS}
      inlineSize={420}
      renderField={props => <FormFileUploadField label={LABEL} accept={ACCEPT} upload={upload} {...props} />}
    />
  ),
}

const MOBILE_VARIANTS: ReadonlyArray<Variant> = [
  { label: 'default' },
  { label: 'multiple, uploaded', value: TWO_UPLOADED, props: { multiple: true, maxFiles: 3 } },
]

export const Mobile: Story = {
  parameters: { chromatic: { viewports: [BREAKPOINTS.MOBILE - 1] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue={[]}
      variants={MOBILE_VARIANTS}
      renderField={props => <FormFileUploadField label={LABEL} accept={ACCEPT} upload={upload} {...props} />}
    />
  ),
}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FormTextAreaField, type FormTextAreaFieldProps } from '@blocks/Form/FormTextAreaField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@test-utils/storybook/formField'

const LABEL = 'Description'
const VALUE = 'Quarterly office supply restock, split across two deliveries.'

type Variant = FormFieldVariant<string, FormTextAreaFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'empty', value: '' },
  { label: 'placeholder', value: '', props: { placeholder: 'Add description' } },
]

const meta: Meta<typeof FormTextAreaField> = {
  title: 'Blocks/Form/FormTextAreaField',
  component: FormTextAreaField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormTextAreaField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue={VALUE}
      variants={VARIANTS}
      renderField={props => <FormTextAreaField label={LABEL} {...props} />}
    />
  ),
}

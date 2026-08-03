import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FormTextField, type FormTextFieldProps } from '@blocks/forms/FormTextField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@test-utils/storybook/formField'

const LABEL = 'Vendor name'
const VALUE = 'Acme Supply Co.'

type Variant = FormFieldVariant<string, FormTextFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'empty', value: '' },
  { label: 'placeholder', value: '', props: { placeholder: 'Enter a vendor' } },
]

const meta: Meta<typeof FormTextField> = {
  title: 'Blocks/Forms/FormTextField',
  component: FormTextField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormTextField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue={VALUE}
      variants={VARIANTS}
      renderField={props => <FormTextField label={LABEL} {...props} />}
    />
  ),
}

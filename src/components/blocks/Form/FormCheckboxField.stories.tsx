import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FormCheckboxField, type FormCheckboxFieldProps } from '@blocks/Form/FormCheckboxField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@testUtils/storybook/layout/formField'

const LABEL = 'Exclude from reports'

type Variant = FormFieldVariant<boolean, FormCheckboxFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'unselected', value: false },
]

const meta: Meta<typeof FormCheckboxField> = {
  title: 'Blocks/Form/FormCheckboxField',
  component: FormCheckboxField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormCheckboxField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue
      variants={VARIANTS}
      renderField={props => <FormCheckboxField label={LABEL} {...props} />}
    />
  ),
}

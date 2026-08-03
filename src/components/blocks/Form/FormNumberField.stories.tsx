import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FormNumberField, type FormNumberFieldProps } from '@blocks/Form/FormNumberField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@test-utils/storybook/formField'

const LABEL = 'Number of employees'
const VALUE = 42

type Variant = FormFieldVariant<number, FormNumberFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'empty', value: Number.NaN },
  { label: 'placeholder', value: Number.NaN, props: { placeholder: 'Enter a count' } },
  { label: 'bounded to 1-10', value: 10, props: { minValue: 1, maxValue: 10 } },
]

const meta: Meta<typeof FormNumberField> = {
  title: 'Blocks/Form/FormNumberField',
  component: FormNumberField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormNumberField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue={VALUE}
      variants={VARIANTS}
      renderField={props => <FormNumberField label={LABEL} {...props} />}
    />
  ),
}

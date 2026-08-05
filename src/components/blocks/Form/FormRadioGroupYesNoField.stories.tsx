import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  FormRadioGroupYesNoField,
  type FormRadioGroupYesNoFieldProps,
} from '@blocks/Form/FormRadioGroupYesNoField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@testUtils/storybook/layout/formField'

const LABEL = 'Do you own this vehicle?'

type Variant = FormFieldVariant<boolean, FormRadioGroupYesNoFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'no selected', value: false },
  { label: 'vertical', props: { orientation: 'vertical' } },
]

const meta: Meta<typeof FormRadioGroupYesNoField> = {
  title: 'Blocks/Form/FormRadioGroupYesNoField',
  component: FormRadioGroupYesNoField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormRadioGroupYesNoField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue
      variants={VARIANTS}
      renderField={props => <FormRadioGroupYesNoField label={LABEL} {...props} />}
    />
  ),
}

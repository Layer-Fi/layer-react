import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  FormRadioGroupYesNoField,
  type FormRadioGroupYesNoFieldProps,
} from '@blocks/forms/FormRadioGroupYesNoField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@test-utils/storybook/formField'

const LABEL = 'Do you own this vehicle?'

const VARIANTS: ReadonlyArray<FormFieldVariant<boolean, FormRadioGroupYesNoFieldProps>> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'no selected', value: false },
  { label: 'vertical', props: { orientation: 'vertical' } },
]

const meta: Meta<typeof FormRadioGroupYesNoField> = {
  title: 'Blocks/Forms/FormRadioGroupYesNoField',
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

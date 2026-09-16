import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  FormRadioGroupField,
  type FormRadioGroupFieldProps,
  type RadioOption,
} from '@blocks/Form/FormRadioGroupField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@testUtils/storybook/layout/formField'

const LABEL = 'Trip purpose'

type Purpose = 'business' | 'personal' | 'unreviewed'

const OPTIONS: RadioOption<Purpose>[] = [
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal' },
  { value: 'unreviewed', label: 'Not reviewed' },
]

type Variant = FormFieldVariant<Purpose | null, FormRadioGroupFieldProps<Purpose>>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'unselected', value: null },
  { label: 'horizontal', props: { orientation: 'horizontal' } },
]

const meta: Meta<typeof FormRadioGroupField<Purpose>> = {
  title: 'Blocks/Form/FormRadioGroupField',
  component: FormRadioGroupField,
  args: { label: LABEL, options: OPTIONS },
}

export default meta

type Story = StoryObj<typeof FormRadioGroupField<Purpose>>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue='business'
      variants={VARIANTS}
      renderField={props => (
        <FormRadioGroupField<Purpose> label={LABEL} options={OPTIONS} {...props} />
      )}
    />
  ),
}

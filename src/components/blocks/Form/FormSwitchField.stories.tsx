import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Sparkles } from 'lucide-react'

import { FormSwitchField, type FormSwitchFieldProps } from '@blocks/Form/FormSwitchField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@testUtils/storybook/layout/formField'

const LABEL = 'Auto-categorize transactions'

type Variant = FormFieldVariant<boolean, FormSwitchFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'unselected', value: false },
  { label: 'label icon', props: { slots: { LabelIcon: <Sparkles size={14} /> } } },
]

const meta: Meta<typeof FormSwitchField> = {
  title: 'Blocks/Form/FormSwitchField',
  component: FormSwitchField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormSwitchField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue
      variants={VARIANTS}
      renderField={props => <FormSwitchField label={LABEL} {...props} />}
    />
  ),
}

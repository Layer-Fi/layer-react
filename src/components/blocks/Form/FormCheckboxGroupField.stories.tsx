import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  type CheckboxOption,
  FormCheckboxGroupField,
  type FormCheckboxGroupFieldProps,
} from '@blocks/Form/FormCheckboxGroupField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@testUtils/storybook/layout/formField'

const LABEL = 'Before we close the month'

type Confirmation = 'figures' | 'copy'

const OPTIONS: CheckboxOption<Confirmation>[] = [
  { value: 'figures', label: 'The figures are right', isRequired: true },
  { value: 'copy', label: 'Email me a copy' },
]

type Variant = FormFieldVariant<Confirmation[], FormCheckboxGroupFieldProps<Confirmation>>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'nothing checked', value: [] },
  { label: 'row layout', props: { layout: 'row' } },
  { label: 'optional marked', props: { layout: 'row', markOptional: true } },
]

const meta: Meta<typeof FormCheckboxGroupField<Confirmation>> = {
  title: 'Blocks/Form/FormCheckboxGroupField',
  component: FormCheckboxGroupField,
  args: { label: LABEL, options: OPTIONS },
}

export default meta

type Story = StoryObj<typeof FormCheckboxGroupField<Confirmation>>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue={['figures']}
      variants={VARIANTS}
      renderField={props => (
        <FormCheckboxGroupField<Confirmation> label={LABEL} options={OPTIONS} {...props} />
      )}
    />
  ),
}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type CheckboxVariant } from '@ui/Checkbox/Checkbox'
import { type CheckboxOption, FormCheckboxGroupField } from '@blocks/Form/FormCheckboxGroupField'
import type { CommonFormFieldProps } from '@blocks/Form/types'

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

type Variant = FormFieldVariant<Confirmation[], CommonFormFieldProps & { variant?: CheckboxVariant, markOptional?: boolean }>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'nothing checked', value: [] },
  { label: 'row', props: { variant: 'row' } },
  { label: 'row, optional marked', props: { variant: 'row', markOptional: true } },
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
      renderField={({ variant, markOptional, ...props }) => (variant === 'row'
        ? <FormCheckboxGroupField<Confirmation> label={LABEL} options={OPTIONS} variant='row' markOptional={markOptional} {...props} />
        : <FormCheckboxGroupField<Confirmation> label={LABEL} options={OPTIONS} variant={variant} {...props} />)}
    />
  ),
}

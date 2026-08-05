import { CalendarDate } from '@internationalized/date'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FormDateField, type FormDateFieldProps } from '@blocks/Form/FormDateField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@testUtils/storybook/layout/formField'

const LABEL = 'Trip date'
const VALUE = new CalendarDate(2026, 3, 14)

type Variant = FormFieldVariant<CalendarDate | null, FormDateFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'empty', value: null },
]

const meta: Meta<typeof FormDateField> = {
  title: 'Blocks/Form/FormDateField',
  component: FormDateField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormDateField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue={VALUE}
      variants={VARIANTS}
      renderField={props => <FormDateField<CalendarDate> label={LABEL} {...props} />}
    />
  ),
}

import { CalendarDate } from '@internationalized/date'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  FormDatePickerField,
  type FormDatePickerFieldProps,
} from '@blocks/forms/FormDatePickerField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@test-utils/storybook/formField'

const LABEL = 'Effective date'
const VALUE = new CalendarDate(2026, 3, 14)

type Variant = FormFieldVariant<CalendarDate | null, FormDatePickerFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'empty', value: null },
  {
    label: 'bounded range',
    props: { minDate: new CalendarDate(2026, 3, 1), maxDate: new CalendarDate(2026, 3, 31) },
  },
]

const meta: Meta<typeof FormDatePickerField> = {
  title: 'Blocks/Forms/FormDatePickerField',
  component: FormDatePickerField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormDatePickerField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue={VALUE}
      variants={VARIANTS}
      renderField={props => <FormDatePickerField<CalendarDate> label={LABEL} {...props} />}
    />
  ),
}

import { type Meta, type StoryObj } from '@storybook/react-vite'
import { BigDecimal as BD } from 'effect'

import {
  type NonRecursiveBigDecimal,
  toNonRecursiveBigDecimal,
} from '@schemas/nonRecursiveBigDecimal'
import { Badge, BadgeSize } from '@ui/Badge/Badge'
import {
  FormNonRecursiveBigDecimalField,
  type FormNonRecursiveBigDecimalFieldProps,
} from '@blocks/forms/FormNonRecursiveBigDecimalField'

import {
  COMMON_FIELD_VARIANTS,
  ERROR_FIELD_VARIANTS,
  type FormFieldVariant,
  FormFieldVariantGallery,
} from '@test-utils/storybook/formField'

const LABEL = 'Amount'
const VALUE = toNonRecursiveBigDecimal(BD.unsafeFromString('1234.56'))
const PERCENT_VALUE = toNonRecursiveBigDecimal(BD.unsafeFromString('0.075'))

type Variant = FormFieldVariant<NonRecursiveBigDecimal | null, FormNonRecursiveBigDecimalFieldProps>

const VARIANTS: ReadonlyArray<Variant> = [
  ...COMMON_FIELD_VARIANTS,
  ...ERROR_FIELD_VARIANTS,
  { label: 'empty', value: null, props: { allowEmpty: true } },
  { label: 'placeholder', value: null, props: { allowEmpty: true, placeholder: 'Enter amount' } },
  { label: 'currency mode', props: { mode: 'currency' } },
  { label: 'percent mode', value: PERCENT_VALUE, props: { mode: 'percent' } },
  {
    label: 'badge slot',
    props: { slots: { badge: <Badge size={BadgeSize.SMALL}>miles</Badge> } },
  },
]

const meta: Meta<typeof FormNonRecursiveBigDecimalField> = {
  title: 'Blocks/Forms/FormNonRecursiveBigDecimalField',
  component: FormNonRecursiveBigDecimalField,
  args: { label: LABEL },
}

export default meta

type Story = StoryObj<typeof FormNonRecursiveBigDecimalField>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <FormFieldVariantGallery
      defaultValue={VALUE}
      variants={VARIANTS}
      renderField={props => <FormNonRecursiveBigDecimalField label={LABEL} {...props} />}
    />
  ),
}

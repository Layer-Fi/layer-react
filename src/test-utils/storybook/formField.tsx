import { type PropsWithChildren, type ReactNode } from 'react'

import { useAppForm } from '@hooks/features/forms/useForm'
import type { CommonFormFieldProps } from '@blocks/forms/types'

import { Col, Gallery } from '@test-utils/storybook/gallery'

type FormFieldHarnessProps = {
  // Typed as `unknown` on purpose: a generic value type makes useAppForm hit TS2589.
  defaultValue: unknown
  errorText?: string
}

export function FormFieldHarness({
  defaultValue,
  errorText,
  children,
}: PropsWithChildren<FormFieldHarnessProps>) {
  const form = useAppForm({ defaultValues: { field: defaultValue } })

  return (
    <form.AppField
      name='field'
      validators={errorText ? { onMount: () => errorText } : {}}
    >
      {() => children}
    </form.AppField>
  )
}

export type FormFieldVariant<TValue, TProps> = {
  label: string
  value?: TValue
  errorText?: string
  props?: Partial<TProps>
}

export const COMMON_FIELD_VARIANTS: ReadonlyArray<FormFieldVariant<never, CommonFormFieldProps>> = [
  { label: 'default' },
  { label: 'no label', props: { showLabel: false } },
  { label: 'inline', props: { inline: true } },
  { label: 'centered', props: { align: 'center' } },
  { label: 'read only', props: { isReadOnly: true } },
  { label: 'disabled', props: { isDisabled: true } },
]

export const ERROR_FIELD_VARIANTS: ReadonlyArray<FormFieldVariant<never, CommonFormFieldProps>> = [
  { label: 'invalid', errorText: 'Enter a valid value' },
  { label: 'invalid, error hidden', errorText: 'Enter a valid value', props: { showFieldError: false } },
  { label: 'overridden error text', errorText: 'Enter a valid value', props: { errorText: 'This value is not allowed' } },
]

type FormFieldVariantGalleryProps<TValue, TProps> = {
  defaultValue: TValue
  variants: ReadonlyArray<FormFieldVariant<TValue, TProps>>
  renderField: (props: Partial<TProps>) => ReactNode
  inlineSize?: number
}

export function FormFieldVariantGallery<TValue, TProps>({
  defaultValue,
  variants,
  renderField,
  inlineSize = 320,
}: FormFieldVariantGalleryProps<TValue, TProps>) {
  return (
    <Gallery direction='row' wrap gap={32}>
      {variants.map(({ label, value, errorText, props }) => (
        <Col key={label} label={label} inlineSize={inlineSize}>
          <FormFieldHarness
            defaultValue={value === undefined ? defaultValue : value}
            errorText={errorText}
          >
            {renderField(props ?? {})}
          </FormFieldHarness>
        </Col>
      ))}
    </Gallery>
  )
}

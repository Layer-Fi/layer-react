import { type PropsWithChildren } from 'react'

import { useAppForm } from '@blocks/Form/useForm'

type FormFieldHarnessProps = {
  // Typed as `unknown` on purpose: a generic value type makes useAppForm hit TS2589.
  defaultValue: unknown
  errorText?: string
}

/** A one-field form for rendering a `Form*Field` on its own; the field reads its value through context. */
export function FormFieldHarness({ defaultValue, errorText, children }: PropsWithChildren<FormFieldHarnessProps>) {
  const form = useAppForm({ defaultValues: { field: defaultValue } })

  return (
    <form.AppField name='field' validators={errorText ? { onMount: () => errorText } : {}}>
      {() => children}
    </form.AppField>
  )
}

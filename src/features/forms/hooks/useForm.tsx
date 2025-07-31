import { createFormHookContexts, createFormHook } from '@tanstack/react-form'
import { BaseFormTextField } from '../components/BaseFormTextField'
import { FormBigDecimalField } from '../components/FormBigDecimalField'
import { FormCheckboxField } from '../components/FormCheckboxField'
import { FormTextAreaField } from '../components/FormTextAreaField'
import { FormTextField } from '../components/FormTextField'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    BaseFormTextField,
    FormBigDecimalField,
    FormCheckboxField,
    FormTextAreaField,
    FormTextField,
  },
  formComponents: {
    // TODO: define a submit button component
  },
  fieldContext,
  formContext,
})

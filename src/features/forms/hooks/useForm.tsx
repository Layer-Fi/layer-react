import {
  createFormHookContexts,
  createFormHook,
  useForm as internalUseForm,
  type FormOptions,
  type FormValidateOrFn,
  type FormAsyncValidateOrFn,
} from '@tanstack/react-form'
import { BaseFormTextField } from '../components/BaseFormTextField'
import { FormBigDecimalField } from '../components/FormBigDecimalField'
import { FormCheckboxField } from '../components/FormCheckboxField'
import { FormDateField } from '../components/FormDateField'
import { FormTextAreaField } from '../components/FormTextAreaField'
import { FormTextField } from '../components/FormTextField'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

const { useAppForm: useInternalAppForm } = createFormHook({
  fieldComponents: {
    BaseFormTextField,
    FormBigDecimalField,
    FormCheckboxField,
    FormDateField,
    FormTextAreaField,
    FormTextField,
  },
  formComponents: {
    // TODO: define a submit button component
  },
  fieldContext,
  formContext,
})

export function useAppForm<T extends Record<string, unknown>>(props: FormOptions<
  T,
  FormValidateOrFn<T>,
  FormValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  FormValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  FormValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  FormValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  unknown
>) {
  return useInternalAppForm(props)
}

export function useForm<T extends Record<string, unknown>>(props: FormOptions<
  T,
  FormValidateOrFn<T>,
  FormValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  FormValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  FormValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  FormValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  FormAsyncValidateOrFn<T>,
  unknown
>) {
  return internalUseForm(props)
}

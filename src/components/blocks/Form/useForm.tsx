import {
  createFormHook,
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
  useForm as internalUseForm,
} from '@tanstack/react-form'

import { BaseFormTextField } from './BaseFormTextField'
import { FormCheckboxField } from './FormCheckboxField'
import { fieldContext, formContext } from './formContexts'
import { FormDateField } from './FormDateField'
import { FormDatePickerField } from './FormDatePickerField'
import { FormNonRecursiveBigDecimalField } from './FormNonRecursiveBigDecimalField'
import { FormNumberField } from './FormNumberField'
import { FormRadioGroupField } from './FormRadioGroupField'
import { FormRadioGroupYesNoField } from './FormRadioGroupYesNoField'
import { FormSwitchField } from './FormSwitchField'
import { FormTextAreaField } from './FormTextAreaField'
import { FormTextField } from './FormTextField'

export { fieldContext, formContext, useFieldContext, useFormContext } from './formContexts'

const { useAppForm: useRawAppForm } = createFormHook({
  fieldComponents: {
    BaseFormTextField,
    FormCheckboxField,
    FormDateField,
    FormDatePickerField,
    FormNonRecursiveBigDecimalField,
    FormNumberField,
    FormRadioGroupField,
    FormRadioGroupYesNoField,
    FormSwitchField,
    FormTextAreaField,
    FormTextField,
  },
  formComponents: {
    // TODO: define a submit button component
  },
  fieldContext,
  formContext,
})

export { useRawAppForm }

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
  return useRawAppForm(props)
}

export type AppForm<T extends Record<string, unknown>> = ReturnType<typeof useAppForm<T>>

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

import {
  createFormHook,
  createFormHookContexts,
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
  useForm as internalUseForm,
} from '@tanstack/react-form'

import { BaseFormTextField } from '@components/forms/BaseFormTextField'
import { FormBigDecimalField } from '@components/forms/FormBigDecimalField'
import { FormCheckboxField } from '@components/forms/FormCheckboxField'
import { FormDateField } from '@components/forms/FormDateField'
import { FormDatePickerField } from '@components/forms/FormDatePickerField'
import { FormNonRecursiveBigDecimalField } from '@components/forms/FormNonRecursiveBigDecimalField'
import { FormNumberField } from '@components/forms/FormNumberField'
import { FormRadioGroupField } from '@components/forms/FormRadioGroupField'
import { FormRadioGroupYesNoField } from '@components/forms/FormRadioGroupYesNoField'
import { FormSwitchField } from '@components/forms/FormSwitchField'
import { FormTextAreaField } from '@components/forms/FormTextAreaField'
import { FormTextField } from '@components/forms/FormTextField'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

const { useAppForm: useRawAppForm } = createFormHook({
  fieldComponents: {
    BaseFormTextField,
    FormBigDecimalField,
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

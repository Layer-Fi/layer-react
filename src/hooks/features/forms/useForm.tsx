import {
  createFormHook,
  createFormHookContexts,
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
  useForm as internalUseForm,
} from '@tanstack/react-form'

import { BaseFormTextField } from '@features/forms/components/BaseFormTextField'
import { FormBigDecimalField } from '@features/forms/components/FormBigDecimalField'
import { FormCheckboxField } from '@features/forms/components/FormCheckboxField'
import { FormDateField } from '@features/forms/components/FormDateField'
import { FormDatePickerField } from '@features/forms/components/FormDatePickerField'
import { FormNonRecursiveBigDecimalField } from '@features/forms/components/FormNonRecursiveBigDecimalField'
import { FormNumberField } from '@features/forms/components/FormNumberField'
import { FormRadioGroupField } from '@features/forms/components/FormRadioGroupField'
import { FormRadioGroupYesNoField } from '@features/forms/components/FormRadioGroupYesNoField'
import { FormSwitchField } from '@features/forms/components/FormSwitchField'
import { FormTextAreaField } from '@features/forms/components/FormTextAreaField'
import { FormTextField } from '@features/forms/components/FormTextField'

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

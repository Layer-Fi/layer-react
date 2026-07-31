import {
  createFormHook,
  createFormHookContexts,
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
  useForm as internalUseForm,
} from '@tanstack/react-form'

import { BaseFormTextField } from '@blocks/forms/BaseFormTextField'
import { FormCheckboxField } from '@blocks/forms/FormCheckboxField'
import { FormDateField } from '@blocks/forms/FormDateField'
import { FormDatePickerField } from '@blocks/forms/FormDatePickerField'
import { FormNonRecursiveBigDecimalField } from '@blocks/forms/FormNonRecursiveBigDecimalField'
import { FormNumberField } from '@blocks/forms/FormNumberField'
import { FormRadioGroupField } from '@blocks/forms/FormRadioGroupField'
import { FormRadioGroupYesNoField } from '@blocks/forms/FormRadioGroupYesNoField'
import { FormSwitchField } from '@blocks/forms/FormSwitchField'
import { FormTextAreaField } from '@blocks/forms/FormTextAreaField'
import { FormTextField } from '@blocks/forms/FormTextField'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

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

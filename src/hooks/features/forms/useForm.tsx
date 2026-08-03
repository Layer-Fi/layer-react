import {
  createFormHook,
  createFormHookContexts,
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
  useForm as internalUseForm,
} from '@tanstack/react-form'

import { BaseFormTextField } from '@blocks/Form/BaseFormTextField'
import { FormCheckboxField } from '@blocks/Form/FormCheckboxField'
import { FormDateField } from '@blocks/Form/FormDateField'
import { FormDatePickerField } from '@blocks/Form/FormDatePickerField'
import { FormNonRecursiveBigDecimalField } from '@blocks/Form/FormNonRecursiveBigDecimalField'
import { FormNumberField } from '@blocks/Form/FormNumberField'
import { FormRadioGroupField } from '@blocks/Form/FormRadioGroupField'
import { FormRadioGroupYesNoField } from '@blocks/Form/FormRadioGroupYesNoField'
import { FormSwitchField } from '@blocks/Form/FormSwitchField'
import { FormTextAreaField } from '@blocks/Form/FormTextAreaField'
import { FormTextField } from '@blocks/Form/FormTextField'

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

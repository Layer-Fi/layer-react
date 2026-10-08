import {
  createFormHook,
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
  useForm as internalUseForm,
} from '@tanstack/react-form'

import { BaseFormTextField } from './BaseFormTextField'
import { FormCheckboxField } from './FormCheckboxField'
import { FormChipGroupField } from './FormChipGroupField'
import { fieldContext, formContext } from './formContexts'
import { FormDateField } from './FormDateField'
import { FormDatePickerField } from './FormDatePickerField'
import { FormFileUploadField } from './FormFileUploadField'
import { FormNonRecursiveBigDecimalField } from './FormNonRecursiveBigDecimalField'
import { FormNumberField } from './FormNumberField'
import { FormRadioGroupField } from './FormRadioGroupField'
import { FormRadioGroupYesNoField } from './FormRadioGroupYesNoField'
import { FormSearchComboBoxField } from './FormSearchComboBoxField'
import { FormSwitchField } from './FormSwitchField'
import { FormTextAreaField } from './FormTextAreaField'
import { FormTextField } from './FormTextField'

export { fieldContext, formContext, useFieldContext, useFormContext } from './formContexts'

const { useAppForm: useRawAppForm, withFieldGroup, withForm } = createFormHook({
  fieldComponents: {
    BaseFormTextField,
    FormCheckboxField,
    FormChipGroupField,
    FormDateField,
    FormDatePickerField,
    FormFileUploadField,
    FormNonRecursiveBigDecimalField,
    FormNumberField,
    FormRadioGroupField,
    FormRadioGroupYesNoField,
    FormSearchComboBoxField,
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

export { useRawAppForm, withFieldGroup, withForm }

export function useAppForm<T extends Record<string, unknown>, TSubmitMeta = unknown>(props: FormOptions<
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
  TSubmitMeta
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

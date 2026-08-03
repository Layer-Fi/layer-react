import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type Customer, type CustomerForm, UpsertCustomerSchema } from '@schemas/customer'
import { useUpsertCustomer } from '@api/businesses/[business-id]/customers/upsert'
import { useAppForm } from '@hooks/features/forms/useForm'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { convertCustomerFormToUpsertCustomer, type CustomerFormState, getCustomerFormDefaultValues, validateCustomerForm } from '@features/customerVendor/CustomerForm/formUtils'

type onSuccessFn = (customer: Customer) => void
type UseCustomerFormProps = { onSuccess: onSuccessFn } & CustomerFormState

export const useCustomerForm = (props: UseCustomerFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, mode } = props

  const customer = mode === UpsertMode.Update ? props.customer : undefined
  const initialName = mode === UpsertMode.Create ? props.initialName : undefined

  const formDefaults = useMemo((): CustomerForm => {
    const formState: CustomerFormState = mode === UpsertMode.Update && customer
      ? { mode: UpsertMode.Update, customer }
      : { mode: UpsertMode.Create, initialName }

    return getCustomerFormDefaultValues(formState)
  }, [mode, customer, initialName])

  const { trigger: upsertCustomer } = useUpsertCustomer(
    mode === UpsertMode.Update
      ? { mode: UpsertMode.Update, customerId: props.customer.id }
      : { mode: UpsertMode.Create },
  )

  const defaultValuesRef = useRef<CustomerForm>(formDefaults)
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: CustomerForm }) => {
    try {
      const customerParams = convertCustomerFormToUpsertCustomer(value)
      const upsertCustomerRequest = Schema.encodeUnknownSync(UpsertCustomerSchema)(customerParams)
      const result = await upsertCustomer(upsertCustomerRequest)

      setSubmitError(undefined)
      onSuccess(result)
    }
    catch (e) {
      console.error(e)
      setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
    }
  }, [onSuccess, upsertCustomer, t])

  const onDynamic = useCallback(({ value }: { value: CustomerForm }) => {
    return validateCustomerForm({ customer: value }, t)
  }, [t])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<CustomerForm>({
    defaultValues,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  useEffect(() => {
    form.reset(formDefaults)
  }, [form, formDefaults])

  return useMemo(() => ({ form, submitError }), [form, submitError])
}

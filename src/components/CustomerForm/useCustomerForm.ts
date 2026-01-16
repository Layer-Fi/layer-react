import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'

import { type Customer, type CustomerForm, UpsertCustomerSchema } from '@schemas/customer'
import { convertCustomerFormToUpsertCustomer, type CustomerFormState, getCustomerFormDefaultValues, validateCustomerForm } from '@components/CustomerForm/formUtils'
import { UpsertCustomerMode, useUpsertCustomer } from '@features/customers/api/useUpsertCustomer'
import { useAppForm } from '@features/forms/hooks/useForm'

type onSuccessFn = (customer: Customer) => void
type UseCustomerFormProps = { onSuccess: onSuccessFn } & CustomerFormState

export const useCustomerForm = (props: UseCustomerFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, ...formState } = props

  const { trigger: upsertCustomer } = useUpsertCustomer(
    props.mode === UpsertCustomerMode.Update
      ? { mode: UpsertCustomerMode.Update, customerId: props.customer.id }
      : { mode: UpsertCustomerMode.Create },
  )

  const defaultValuesRef = useRef<CustomerForm>(getCustomerFormDefaultValues(formState))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: CustomerForm }) => {
    try {
      const customerParams = convertCustomerFormToUpsertCustomer(value)
      const upsertCustomerRequest = Schema.encodeUnknownSync(UpsertCustomerSchema)(customerParams)
      const result = await upsertCustomer(upsertCustomerRequest)

      setSubmitError(undefined)
      onSuccess(result.data)
    }
    catch (e) {
      console.error(e)
      setSubmitError('Something went wrong. Please try again.')
    }
  }, [onSuccess, upsertCustomer])

  const onDynamic = useCallback(({ value }: { value: CustomerForm }) => {
    return validateCustomerForm({ customer: value })
  }, [])

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
    form.reset(getCustomerFormDefaultValues(formState))
  }, [form, formState])

  return useMemo(() => ({ form, submitError }), [form, submitError])
}

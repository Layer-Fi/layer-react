import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic, useStore } from '@tanstack/react-form'
import {
  type FormAsyncValidateOrFn,
  type FormValidateOrFn,
} from '@tanstack/react-form'
import { Schema } from 'effect'

import { useAuth } from '@hooks/useAuth'
import { useInvoicesContext } from '@contexts/InvoicesContext/InvoicesContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { convertInvoiceFormToParams, convertPaymentMethodsToApiRequest, getInvoiceFormDefaultValues, getPaymentMethodsFromApiResponse, validateInvoiceForm } from '@components/Invoices/InvoiceForm/formUtils'
import {
  computeAdditionalDiscount,
  computeGrandTotal,
  computeRawTaxableSubtotal,
  computeSubtotal,
  computeTaxableSubtotal,
  computeTaxes,
} from '@components/Invoices/InvoiceForm/totalsUtils'
import { validateInvoiceFormByStep } from '@components/Invoices/InvoiceForm/validators'
import { useRawAppForm } from '@features/forms/hooks/useForm'
import { type InvoicePaymentMethodType } from '@features/invoices/api/useInvoicePaymentMethods'
import { updateInvoicePaymentMethods } from '@features/invoices/api/useUpdateInvoicePaymentMethods'
import { UpsertInvoiceMode, useUpsertInvoice } from '@features/invoices/api/useUpsertInvoice'
import { type Invoice, type InvoiceForm, InvoiceFormStep, UpsertInvoiceSchema } from '@features/invoices/invoiceSchemas'

type onSuccessFn = (invoice: Invoice) => void
type UseInvoiceFormProps =
  | { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Create, initialPaymentMethods?: readonly InvoicePaymentMethodType[] }
  | { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Update, invoice: Invoice, initialPaymentMethods?: readonly InvoicePaymentMethodType[] }

function isUpdateMode(props: UseInvoiceFormProps): props is { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Update, invoice: Invoice } {
  return props.mode === UpsertInvoiceMode.Update
}

export type InvoiceFormMeta = {
  submitAction: 'send' | null
}

export type InvoiceFormType = ReturnType<typeof useRawAppForm<
  InvoiceForm,
  FormValidateOrFn<InvoiceForm>,
  FormValidateOrFn<InvoiceForm>,
  FormAsyncValidateOrFn<InvoiceForm>,
  FormValidateOrFn<InvoiceForm>,
  FormAsyncValidateOrFn<InvoiceForm>,
  FormValidateOrFn<InvoiceForm>,
  FormAsyncValidateOrFn<InvoiceForm>,
  FormValidateOrFn<InvoiceForm>,
  FormAsyncValidateOrFn<InvoiceForm>,
  FormAsyncValidateOrFn<InvoiceForm>,
  InvoiceFormMeta
>>

const onSubmitMeta: InvoiceFormMeta = {
  submitAction: null,
}

export const useInvoiceForm = (props: UseInvoiceFormProps) => {
  const { onSuccess, mode, initialPaymentMethods } = props

  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSendInvoice } = useInvoicesContext()
  const { businessId } = useLayerContext()
  const { data: authData } = useAuth()

  const upsertInvoiceProps = mode === UpsertInvoiceMode.Update ? { mode, invoiceId: props.invoice.id } : { mode }
  const { trigger: upsertInvoice } = useUpsertInvoice(upsertInvoiceProps)

  const invoice = isUpdateMode(props) ? props.invoice : null
  const initialPaymentMethodsForm = initialPaymentMethods
    ? getPaymentMethodsFromApiResponse(initialPaymentMethods)
    : undefined
  const defaultValuesRef = useRef<InvoiceForm>(getInvoiceFormDefaultValues(invoice, initialPaymentMethodsForm))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value, meta }: { value: InvoiceForm, meta: InvoiceFormMeta }) => {
    try {
      const upsertInvoiceParams = convertInvoiceFormToParams(value)
      const upsertInvoiceRequest = Schema.encodeUnknownSync(UpsertInvoiceSchema)(upsertInvoiceParams)

      const { data: invoice } = await upsertInvoice(upsertInvoiceRequest)

      if (authData?.apiUrl && authData?.access_token) {
        const paymentMethodsToSave = convertPaymentMethodsToApiRequest(value.paymentMethods)
        await updateInvoicePaymentMethods(
          authData.apiUrl,
          authData.access_token,
          {
            params: { businessId, invoiceId: invoice.id },
            body: { payment_methods: paymentMethodsToSave },
          },
        )
      }

      setSubmitError(undefined)
      onSuccess(invoice)

      if (meta.submitAction === 'send' && onSendInvoice) {
        await onSendInvoice(invoice.id)
      }
    }
    catch (e) {
      console.error(e)
      setSubmitError('Something went wrong. Please try again.')
    }
  }, [onSendInvoice, onSuccess, upsertInvoice, authData, businessId])

  const validators = useMemo(() => ({
    onDynamic: validateInvoiceFormByStep,
  }), [])

  const form = useRawAppForm<
    InvoiceForm,
    FormValidateOrFn<InvoiceForm>,
    FormValidateOrFn<InvoiceForm>,
    FormAsyncValidateOrFn<InvoiceForm>,
    FormValidateOrFn<InvoiceForm>,
    FormAsyncValidateOrFn<InvoiceForm>,
    FormValidateOrFn<InvoiceForm>,
    FormAsyncValidateOrFn<InvoiceForm>,
    FormValidateOrFn<InvoiceForm>,
    FormAsyncValidateOrFn<InvoiceForm>,
    FormAsyncValidateOrFn<InvoiceForm>,
    InvoiceFormMeta
  >({
    defaultValues,
    onSubmit,
    onSubmitMeta,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  const isDirty = useStore(form.store, state => state.isDirty)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  const hasActualChanges = useStore(form.store, (state) => {
    const { step: _currentStep, ...currentValues } = state.values
    const { step: _defaultStep, ...initialValues } = defaultValues
    return JSON.stringify(currentValues) !== JSON.stringify(initialValues)
  })

  const formState = useMemo(() => ({
    isDirty,
    isSubmitting,
    hasActualChanges,
  }), [isDirty, isSubmitting, hasActualChanges])

  const discountRate = useStore(form.store, state => state.values.discountRate)
  const taxRate = useStore(form.store, state => state.values.taxRate)

  const { subtotal, rawTaxableSubtotal } = useStore(form.store, (state) => {
    const lineItems = state.values.lineItems
    return {
      subtotal: computeSubtotal(lineItems),
      rawTaxableSubtotal: computeRawTaxableSubtotal(lineItems),
    }
  })

  const additionalDiscount = useMemo(() =>
    computeAdditionalDiscount({ subtotal, discountRate }),
  [subtotal, discountRate],
  )

  const taxableSubtotal = useMemo(() =>
    computeTaxableSubtotal({ rawTaxableSubtotal, discountRate }),
  [rawTaxableSubtotal, discountRate],
  )

  const taxes = useMemo(() =>
    computeTaxes({ taxableSubtotal, taxRate }),
  [taxableSubtotal, taxRate],
  )

  const grandTotal = useMemo(() =>
    computeGrandTotal({ subtotal, additionalDiscount, taxes }),
  [subtotal, additionalDiscount, taxes],
  )

  const totals = useMemo(() => ({
    subtotal, additionalDiscount, taxableSubtotal, taxes, grandTotal,
  }), [additionalDiscount, grandTotal, subtotal, taxableSubtotal, taxes])

  const currentStep = useStore(form.store, state => state.values.step)

  const goToPreviousStep = useCallback(() => {
    if (currentStep === InvoiceFormStep.PaymentMethods) {
      form.setFieldValue('step', InvoiceFormStep.Details)
    }
  }, [form, currentStep])

  const goToNextStep = useCallback(() => {
    if (currentStep === InvoiceFormStep.Details) {
      const currentValues = form.state.values
      const validationErrors = validateInvoiceForm({ value: currentValues })

      if (validationErrors && validationErrors.length > 0) {
        const firstError = validationErrors[0]
        const errorMessage = typeof firstError === 'object'
          ? (Object.values(firstError)[0] as string)
          : String(firstError)
        setSubmitError(errorMessage)
        return false
      }

      setSubmitError(undefined)
      form.setFieldValue('step', InvoiceFormStep.PaymentMethods)
      return true
    }
    return false
  }, [form, currentStep])

  return useMemo(() => ({
    form,
    formState,
    totals,
    submitError,
    currentStep,
    goToPreviousStep,
    goToNextStep,
  }), [form, formState, totals, submitError, currentStep, goToPreviousStep, goToNextStep])
}

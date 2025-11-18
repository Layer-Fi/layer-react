import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic, useStore } from '@tanstack/react-form'
import {
  type FormAsyncValidateOrFn,
  type FormValidateOrFn,
} from '@tanstack/react-form'
import { Schema } from 'effect'

import { useInvoicesContext } from '@contexts/InvoicesContext/InvoicesContext'
import { convertInvoiceFormToParams, getInvoiceFormDefaultValues, getInvoiceFormInitialValues, validateInvoiceForm } from '@components/Invoices/InvoiceForm/formUtils'
import {
  computeAdditionalDiscount,
  computeGrandTotal,
  computeRawTaxableSubtotal,
  computeSubtotal,
  computeTaxableSubtotal,
  computeTaxes,
} from '@components/Invoices/InvoiceForm/totalsUtils'
import { useRawAppForm } from '@features/forms/hooks/useForm'
import { UpsertInvoiceMode, useUpsertInvoice } from '@features/invoices/api/useUpsertInvoice'
import { type Invoice, type InvoiceForm, UpsertInvoiceSchema } from '@features/invoices/invoiceSchemas'

type onSuccessFn = (invoice: Invoice) => void
type UseInvoiceFormProps =
  | { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Create }
  | { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Update, invoice: Invoice }

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
  const { onSuccess, mode } = props

  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSendInvoice } = useInvoicesContext()

  const upsertInvoiceProps = mode === UpsertInvoiceMode.Update ? { mode, invoiceId: props.invoice.id } : { mode }
  const { trigger: upsertInvoice } = useUpsertInvoice(upsertInvoiceProps)

  const defaultValuesRef = useRef<InvoiceForm>(
    isUpdateMode(props)
      ? getInvoiceFormInitialValues(props.invoice)
      : getInvoiceFormDefaultValues(),
  )
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value, meta }: { value: InvoiceForm, meta: InvoiceFormMeta }) => {
    try {
      // Convert the `InvoiceForm` schema to the request shape for `upsertInvoice`. This will
      // throw an error if the request shape is not valid.
      const upsertInvoiceParams = convertInvoiceFormToParams(value)
      const upsertInvoiceRequest = Schema.encodeUnknownSync(UpsertInvoiceSchema)(upsertInvoiceParams)

      const { data: invoice } = await upsertInvoice(upsertInvoiceRequest)

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
  }, [onSendInvoice, onSuccess, upsertInvoice])

  const validators = useMemo(() => ({
    onDynamic: validateInvoiceForm,
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

  const formState = useMemo(() => ({
    isDirty,
    isSubmitting,
  }), [isDirty, isSubmitting])

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

  return useMemo(() => (
    { form, formState, totals, submitError }),
  [form, formState, totals, submitError])
}

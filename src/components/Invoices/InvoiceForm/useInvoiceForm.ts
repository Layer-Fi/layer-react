import { useCallback, useMemo, useState } from 'react'
import { revalidateLogic, useStore } from '@tanstack/react-form'
import { Schema } from 'effect'

import { convertInvoiceFormToParams, getInvoiceFormDefaultValues, validateInvoiceForm } from '@components/Invoices/InvoiceForm/formUtils'
import {
  computeAdditionalDiscount,
  computeGrandTotal,
  computeRawTaxableSubtotal,
  computeSubtotal,
  computeTaxableSubtotal,
  computeTaxes,
} from '@components/Invoices/InvoiceForm/totalsUtils'
import { useAppForm } from '@features/forms/hooks/useForm'
import { UpsertInvoiceMode, useUpsertInvoice } from '@features/invoices/api/useUpsertInvoice'
import { type Invoice, type InvoiceForm, UpsertInvoiceSchema } from '@features/invoices/invoiceSchemas'

type onSuccessFn = (invoice: Invoice) => void
type UseInvoiceFormProps =
  | { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Create }
  | { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Update, invoice: Invoice }

function isUpdateMode(props: UseInvoiceFormProps): props is { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Update, invoice: Invoice } {
  return props.mode === UpsertInvoiceMode.Update
}

export type InvoiceFormType = ReturnType<typeof useAppForm<InvoiceForm>>

export const useInvoiceForm = (props: UseInvoiceFormProps) => {
  const { onSuccess, mode } = props
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)

  const upsertInvoiceProps = mode === UpsertInvoiceMode.Update ? { mode, invoiceId: props.invoice.id } : { mode }
  const { trigger: upsertInvoice } = useUpsertInvoice(upsertInvoiceProps)

  const invoice = isUpdateMode(props) ? props.invoice : null
  const defaultValues = useMemo(() => getInvoiceFormDefaultValues(invoice), [invoice])

  const onSubmit = useCallback(
    async (
      { value, formApi }: { value: InvoiceForm, formApi: { reset: () => void } },
    ) => {
      try {
        const upsertInvoiceParams = convertInvoiceFormToParams(value)
        const upsertInvoiceRequest = Schema.encodeUnknownSync(UpsertInvoiceSchema)(upsertInvoiceParams)

        const { data: upsertedInvoice } = await upsertInvoice(upsertInvoiceRequest)

        setSubmitError(undefined)
        onSuccess(upsertedInvoice)

        formApi.reset()
      }
      catch (e) {
        console.error(e)
        setSubmitError('Something went wrong. Please try again.')
      }
    }, [onSuccess, upsertInvoice])

  const validators = useMemo(() => ({
    onDynamic: validateInvoiceForm,
  }), [])

  const form = useAppForm<InvoiceForm>({
    defaultValues,
    onSubmit,
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

  return useMemo(() => ({ form, formState, totals, submitError }), [form, formState, totals, submitError])
}

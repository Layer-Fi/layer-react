import { useCallback, useMemo, useState, useRef } from 'react'
import { useStore, revalidateLogic } from '@tanstack/react-form'
import { useAppForm } from '../../../features/forms/hooks/useForm'
import { UpsertInvoiceSchema, type Invoice, type InvoiceForm } from '../../../features/invoices/invoiceSchemas'
import { useUpsertInvoice, UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'
import { Schema } from 'effect'
import {
  computeAdditionalDiscount,
  computeGrandTotal,
  computeRawTaxableSubtotal,
  computeSubtotal,
  computeTaxableSubtotal,
  computeTaxes,
} from './totalsUtils'
import { convertInvoiceFormToParams, getInvoiceFormDefaultValues, getInvoiceFormInitialValues, validateInvoiceForm } from './formUtils'

type onSuccessFn = (invoice: Invoice) => void
type UseInvoiceFormProps =
  | { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Create }
  | { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Update, invoice: Invoice }

function isUpdateMode(props: UseInvoiceFormProps): props is { onSuccess: onSuccessFn, mode: UpsertInvoiceMode.Update, invoice: Invoice } {
  return props.mode === UpsertInvoiceMode.Update
}

export const useInvoiceForm = (props: UseInvoiceFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, mode } = props

  const upsertInvoiceProps = mode === UpsertInvoiceMode.Update ? { mode, invoiceId: props.invoice.id } : { mode }
  const { trigger: upsertInvoice } = useUpsertInvoice(upsertInvoiceProps)

  const defaultValuesRef = useRef<InvoiceForm>(
    isUpdateMode(props)
      ? getInvoiceFormInitialValues(props.invoice)
      : getInvoiceFormDefaultValues(),
  )
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: InvoiceForm }) => {
    try {
      // Convert the `InvoiceForm` schema to the request shape for `upsertInvoice`. This will
      // throw an error if the request shape is not valid.
      const upsertInvoiceParams = convertInvoiceFormToParams(value)
      const upsertInvoiceRequest = Schema.encodeUnknownSync(UpsertInvoiceSchema)(upsertInvoiceParams)

      const { data: invoice } = await upsertInvoice(upsertInvoiceRequest)

      setSubmitError(undefined)
      onSuccess(invoice)
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

  return useMemo(() => (
    { form, formState, totals, submitError }),
  [form, formState, totals, submitError])
}

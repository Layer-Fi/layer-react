import { useState } from 'react'
import { Bill, BillLineItem } from '../../types/bills'
import { useForm, FormValidateOrFn, FormAsyncValidateOrFn, useStore } from '@tanstack/react-form'
import { Vendor } from '../../types/vendors'
import { convertFromCents, convertToCents } from '../../utils/format'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useAuth } from '../../hooks/useAuth'
import { useBillsContext } from '../../contexts/BillsContext'

export type BillForm = {
  bill_number?: string
  vendor?: Vendor
  vendor_address?: string
  received_at?: string
  due_at?: string
  terms?: string
  line_items?: (Partial<BillLineItem & { product_name?: string }>) []
}

export const useBillForm = (bill: Bill) => {
  const { businessId, addToast } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { setBillInDetails, refetch } = useBillsContext()

  const form = useForm<
    BillForm,
    FormValidateOrFn<BillForm>,
    FormValidateOrFn<BillForm>,
    FormAsyncValidateOrFn<BillForm>,
    FormValidateOrFn<BillForm>,
    FormAsyncValidateOrFn<BillForm>,
    FormValidateOrFn<BillForm>,
    FormAsyncValidateOrFn<BillForm>,
    FormAsyncValidateOrFn<BillForm>
  >({
    defaultValues: {
      bill_number: bill.bill_number,
      vendor: bill.vendor,
      vendor_address: bill.vendor?.address_string,
      received_at: bill.received_at,
      due_at: bill.due_at,
      terms: bill.terms,
      line_items: bill.line_items.map(item => ({
        ...item,
        total_amount: item.total_amount ? convertFromCents(item.total_amount) : undefined,
        subtotal: item.subtotal ? convertFromCents(item.subtotal) : undefined,
        unit_price: item.unit_price ? convertFromCents(item.unit_price) : undefined,
      })),
    },
    validators: {
      onSubmit: ({ value }) => {
        if (value.line_items) {
          const totalAmount = convertToCents(value.line_items.reduce(
            (acc, item) => acc + (Number(item.total_amount) || 0),
            0)) ?? 0
          if (totalAmount !== bill.total_amount) {
            return 'INVALID_TOTAL_AMOUNT'
          }
        }
        return false
      },
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(undefined)
        const formattedValue = {
          ...value,
          due_at: value.due_at ? new Date(value.due_at).toISOString() : undefined,
          received_at: value.received_at ? new Date(value.received_at).toISOString() : undefined,
          line_items: value.line_items?.map(item => ({
            account_identifier: item.account_identifier
              ? {
                type: item.account_identifier.type,
                id: item.account_identifier.id,
              }
              : undefined,
            description: item.description,
            product_name: item.account_identifier?.product_name ?? item.product_name,
            unit_price: item.total_amount ? convertToCents(item.total_amount) : undefined,
            quantity: '1.00',
            discount_amount: 0,
            sales_taxes: [],
          })),
        }

        const response = await Layer.updateBill(apiUrl, auth?.access_token, {
          params: {
            businessId,
            billId: bill.id,
          },
          body: formattedValue,
        })

        form.reset(response.data, { keepDefaultValues: false })
        setBillInDetails(response.data)
        addToast({ content: 'The Bill has been updated!', type: 'success' })
        refetch()
      }
      catch {
        setSubmitError('Submit failed. Please try again.')
      }
    },
  })

  const isDirty = useStore(form.store, state => state.isDirty)
  const formErrorMap = useStore(form.store, state => state.errorMap)

  return { form, isDirty, submitError, formErrorMap }
}

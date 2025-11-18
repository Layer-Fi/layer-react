import { useState } from 'react'
import { useStore } from '@tanstack/react-form'

import { type Bill, type BillLineItem } from '@internal-types/bills'
import { type Vendor } from '@internal-types/vendors'
import { convertFromCents, convertToCents } from '@utils/format'
import { Layer } from '@api/layer'
import { type SaveBillPayload } from '@api/layer/bills'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useBillsContext } from '@contexts/BillsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useForm } from '@features/forms/hooks/useForm'

export type BillForm = {
  bill_number?: string
  vendor?: Vendor
  vendor_address?: string
  received_at?: string
  due_at?: string
  terms?: string
  line_items?: (Partial<BillLineItem>) []
}

export type EditableBill = Partial<Bill>

export const useBillForm = (bill?: EditableBill) => {
  const { businessId, addToast } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { openBillDetails, refetch } = useBillsContext()

  const form = useForm<BillForm>({
    defaultValues: {
      bill_number: bill?.bill_number,
      vendor: bill?.vendor,
      vendor_address: bill?.vendor?.address_string,
      received_at: bill?.received_at ?? new Date().toISOString(),
      due_at: bill?.due_at ?? new Date().toISOString(),
      terms: bill?.terms,
      line_items: bill?.line_items?.map(item => ({
        ...item,
        total_amount: item.total_amount ? convertFromCents(item.total_amount) : undefined,
        subtotal: item.subtotal ? convertFromCents(item.subtotal) : undefined,
        unit_price: item.unit_price ? convertFromCents(item.unit_price) : undefined,
      })),
    },
    validators: {
      onSubmit: ({ value }) => {
        if (!value.line_items) {
          return 'MISSING_LINE_ITEMS'
        }
        else if (bill?.id) {
          const totalAmount = convertToCents(value.line_items.reduce(
            (acc, item) => acc + (Number(item.total_amount) || 0),
            0)) ?? 0
          if (totalAmount !== bill?.total_amount) {
            return 'INVALID_TOTAL_AMOUNT'
          }
        }
        return false
      },
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(undefined)
        const formattedValue: SaveBillPayload = {
          bill_number: value.bill_number,
          terms: value.terms,
          due_at: value.due_at ? new Date(value.due_at).toISOString() : undefined,
          received_at: value.received_at ? new Date(value.received_at).toISOString() : undefined,
          vendor_id: value.vendor?.id,
          vendor_external_id: value.vendor?.external_id,
          line_items: value.line_items?.map(item => ({
            account_identifier: item.account_identifier
              ? {
                type: item.account_identifier.type,
                id: item.account_identifier.id,
              }
              : undefined,
            description: item.description,
            product_name: item.product_name,
            unit_price: item.total_amount ? convertToCents(item.total_amount) : undefined,
            quantity: 1,
            discount_amount: 0,
            sales_taxes: [],
          })),
        }

        let response
        if (bill?.id) {
          response = await Layer.updateBill(apiUrl, auth?.access_token, {
            params: {
              businessId,
              billId: bill.id,
            },
            body: formattedValue,
          })
        }
        else {
          response = await Layer.createBill(apiUrl, auth?.access_token, {
            params: { businessId },
            body: formattedValue,
          })
        }

        if (!response) {
          throw new Error('Failed to create or update bill')
        }

        form.reset(response.data, { keepDefaultValues: false })
        openBillDetails(response.data)
        addToast({ content: bill?.id ? 'The Bill has been updated!' : 'The Bill has been created!', type: 'success' })
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

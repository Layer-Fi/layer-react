import { useState } from 'react'
import { Bill, BillLineItem } from '../../types/bills'
import { sleep } from '../../utils/helpers'
import { useForm } from '@tanstack/react-form'
import { Vendor } from '../../types/vendors'

export type BillForm = {
  bill_number?: string
  vendor?: Vendor
  vendor_address?: string
  received_at?: string
  due_date?: string
  terms?: string
  line_items?: Partial<BillLineItem>[]
}

export const useBillForm = (bill: Bill) => {
  const [isDirty, setIsDirty] = useState(false)

  const form = useForm<BillForm>({
    defaultValues: {
      bill_number: bill.bill_number,
      vendor: bill.vendor,
      vendor_address: bill.vendor?.address_string,
      received_at: bill.received_at,
      due_date: bill.due_at,
      terms: '',
      line_items: bill.line_items,
    },
    onSubmit: async ({ value }) => {
      console.log('onSubmit - sending...', value)
      await sleep(1000)
    },
  })

  // Watching form.state.isDirty doesn't work as expected.
  // It's not updated when the form is dirty.
  // This `subscribe` and isDirty state are the workaround for this issue.
  form.store.subscribe(state => setIsDirty(state.currentVal.isDirty))

  return { form, isDirty }
}

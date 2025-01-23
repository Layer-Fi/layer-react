import { useState } from 'react'
import { Bill, BillLineItem } from '../../types/bills'
import { sleep } from '../../utils/helpers'
import { useForm } from '@tanstack/react-form'
import { Vendor } from '../../types/vendors'

export type BillForm = {
  bill_number?: string
  vendor?: Vendor
  vendor_address?: string // read-only
  received_at?: string // OR DATE
  due_date?: string // OR DATE
  terms?: string
  line_items?: Partial<BillLineItem>[]
  tax?: boolean // not supported by API?
  billable?: boolean // not supported by API?
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
      terms: '', // @TODO match to updated API
      line_items: bill.line_items,
      // tax: false, // @TODO match to updated API
      // billable: false, // @TODO match to updated API
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

import { Bill, BillLineItem } from '../../types/bills'
import { sleep } from '../../utils/helpers'
import { useForm } from '@tanstack/react-form'

export type VendorOption = {
  id: string
  name: string
}

export type BillForm = {
  bill_number?: string
  vendor?: VendorOption
  vendor_address?: string // read-only
  received_at?: string // OR DATE
  due_date?: string // OR DATE
  terms?: string
  line_items?: Partial<BillLineItem>[]
}

export const useBillForm = (bill: Bill) => {
  const form = useForm<BillForm>({
    defaultValues: {
      bill_number: bill.bill_number,
      vendor: bill.vendor && {
        id: bill.vendor.id,
        name: bill.vendor.company_name ?? '', // @TODO - build function to compose name
      },
      vendor_address: bill.vendor?.address_string,
      received_at: bill.received_at,
      due_date: bill.due_at,
      terms: '', // @TODO match to updated API
      line_items: bill.line_items,
    },
    onSubmit: async ({ value }) => {
      console.log('onSubmit - sending...', value)
      await sleep(1000)
    },
  })

  console.log('bill.due_at', bill.due_at)

  return { form }
}
